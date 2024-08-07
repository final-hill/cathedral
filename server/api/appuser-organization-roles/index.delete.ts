import { z } from "zod"
import { fork } from "~/server/data/orm"
import AppUserOrganizationRole from "~/server/domain/application/AppUserOrganizationRole"
import Organization from "~/server/domain/application/Organization"
import AppRole from "~/server/domain/application/AppRole"
import { getServerSession } from '#auth'

const bodySchema = z.object({
    appUserId: z.string().uuid(),
    organizationId: z.string().uuid(),
    roleName: z.string()
})

/**
 * DELETE /api/appuser-organization-roles
 *
 * Deletes an existing appuser-organization-role
 */
export default defineEventHandler(async (event) => {
    const body = await readValidatedBody(event, (b) => bodySchema.safeParse(b))

    if (!body.success)
        throw createError({
            statusCode: 400,
            statusMessage: "Bad Request: Invalid body parameters",
            message: JSON.stringify(body.error.errors)
        })

    const em = fork(),
        session = (await getServerSession(event))!,
        [organization, role, sessionUserOrgRoles] = await Promise.all([
            em.getReference(Organization, body.data.organizationId),
            em.findOne(AppRole, { name: body.data.roleName }),
            em.find(AppUserOrganizationRole, { appUserId: session.user.id, organization: { id: body.data.organizationId } })
        ]),
        appUserOrganizationRole = await em.findOne(AppUserOrganizationRole, {
            appUserId: body.data.appUserId, organization, role
        })

    if (!organization)
        throw createError({
            statusCode: 404,
            statusMessage: "Not Found: Organization not found"
        })
    if (!role)
        throw createError({
            statusCode: 404,
            statusMessage: "Not Found: Role not found"
        })
    if (!appUserOrganizationRole)
        throw createError({
            statusCode: 404,
            statusMessage: "Not Found: AppUserOrganizationRole not found"
        })

    // An appuser-organization-role can only be deleted by a system admin
    // or the associated organization admin

    if (session.user.isSystemAdmin || sessionUserOrgRoles.some(r => r.role.name === 'Organization Admin')) {
        em.remove(appUserOrganizationRole)
        await em.flush()
    } else {
        throw createError({
            statusCode: 403,
            statusMessage: "Forbidden: You must be a system admin or an organization admin to delete an appuser-organization-role."
        })
    }
})