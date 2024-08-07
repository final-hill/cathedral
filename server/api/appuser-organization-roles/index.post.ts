import { z } from "zod"
import { fork } from "~/server/data/orm"
import AppRole from "~/server/domain/application/AppRole"
import AppUserOrganizationRole from "~/server/domain/application/AppUserOrganizationRole"
import Organization from "~/server/domain/application/Organization"
import { getServerSession } from '#auth'

const bodySchema = z.object({
    appUserId: z.string().uuid(),
    organizationId: z.string().uuid(),
    roleName: z.string()
})

/**
 * POST /api/appuser-organization-roles
 *
 * creates a new appuser-organization-role
 */
export default defineEventHandler(async (event) => {
    const em = fork(),
        body = await readValidatedBody(event, (b) => bodySchema.safeParse(b)),
        session = (await getServerSession(event))!;

    if (!body.success)
        throw createError({
            statusCode: 400,
            statusMessage: "Bad Request: Invalid body parameters",
            message: JSON.stringify(body.error.errors)
        })

    const [organization, role] = await Promise.all([
        em.findOne(Organization, body.data.organizationId),
        em.findOne(AppRole, { name: body.data.roleName })
    ]),
        sessionUserOrgRoles = await em.find(AppUserOrganizationRole, {
            appUserId: session.user.id,
            organization: { id: body.data.organizationId },
        })

    if (!organization)
        throw createError({
            statusCode: 404,
            statusMessage: "Not Found: Organization not found with id " + body.data.organizationId
        })
    if (!role)
        throw createError({
            statusCode: 404,
            statusMessage: "Not Found: Role not found with name " + body.data.roleName
        })

    // If the user is a system admin or an organization admin, create the appuser-organization-role
    if (session.user.isSystemAdmin || sessionUserOrgRoles.some(r => { return r.role.name === 'Organization Admin' })) {
        const appUserOrganizationRole = new AppUserOrganizationRole({
            appUserId: body.data.appUserId, organization, role
        })

        await em.persistAndFlush(appUserOrganizationRole)

        return appUserOrganizationRole
    }

    throw createError({
        statusCode: 403,
        statusMessage: 'Forbidden: You must be a system admin or organization admin to create appuser-organization-roles.'
    })
})