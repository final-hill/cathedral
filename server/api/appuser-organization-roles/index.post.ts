import { z } from "zod"
import { fork } from "~/server/data/orm"
import AppRole from "~/server/domain/application/AppRole"
import AppUser from "~/server/domain/application/AppUser"
import AppUserOrganizationRole from "~/server/domain/application/AppUserOrganizationRole"
import Organization from "~/server/domain/application/Organization"

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
    const config = useRuntimeConfig(),
        em = fork(),
        [body, session] = await Promise.all([
            readValidatedBody(event, (b) => bodySchema.safeParse(b)),
            useSession(event, { password: config.sessionPassword })
        ])

    if (!body.success)
        throw createError({
            statusCode: 400,
            statusMessage: "Bad Request: Invalid body parameters",
            message: JSON.stringify(body.error.errors)
        })

    const [appUser, organization, role, sessionUser] = await Promise.all([
        em.findOne(AppUser, body.data.appUserId),
        em.findOne(Organization, body.data.organizationId),
        em.findOne(AppRole, { name: body.data.roleName }),
        em.findOne(AppUser, { id: session.id })
    ]),
        sessionUserOrgRoles = await em.find(AppUserOrganizationRole, {
            appUser: { id: sessionUser!.id },
            organization: { id: body.data.organizationId },
        })

    if (!appUser)
        throw createError({
            statusCode: 404,
            statusMessage: "Not Found: AppUser not found with id " + body.data.appUserId
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
    if (sessionUser!.isSystemAdmin || sessionUserOrgRoles.some(r => { return r.role.name === 'Organization Admin' })) {
        const appUserOrganizationRole = new AppUserOrganizationRole({
            appUser, organization, role
        })

        await em.persistAndFlush(appUserOrganizationRole)

        return appUserOrganizationRole
    }

    throw createError({
        statusCode: 403,
        statusMessage: 'Forbidden: You must be a system admin or organization admin to create appuser-organization-roles.'
    })
})