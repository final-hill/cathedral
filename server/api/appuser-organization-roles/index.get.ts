import { z } from "zod"
import { fork } from "~/server/data/orm"
import AppUserOrganizationRole from "~/server/domain/application/AppUserOrganizationRole"
import { getServerSession } from '#auth'

const querySchema = z.object({
    appUserId: z.string().uuid().optional(),
    organizationId: z.string().uuid(),
    roleName: z.string().optional()
})

/**
 * GET /api/appuser-organization-roles
 *
 * Returns all appuser-organization-roles for the organization that match the query parameters
 */
export default defineEventHandler(async (event) => {
    const query = await getValidatedQuery(event, (q) => querySchema.safeParse(q)),
        session = (await getServerSession(event))!

    if (!query.success)
        throw createError({
            statusCode: 400,
            statusMessage: "Bad Request: Invalid query parameters",
            message: JSON.stringify(query.error.errors)
        })

    const em = fork()

    const appUserRoles = em.find(AppUserOrganizationRole, {
        organization: { id: query.data.organizationId },
        ...(query.data.appUserId ? { appUserId: query.data.appUserId } : {}),
        ...(query.data.roleName ? { role: { name: query.data.roleName } } : {})
    })

    const sessionUserOrgRoles = await em.find(AppUserOrganizationRole, {
        appUserId: session.user.id,
        organization: { id: query.data.organizationId },
    })

    // If the user is a system admin or an organization admin, return all appuser-organization-roles
    // filtered by the query parameters
    if (session.user.isSystemAdmin || sessionUserOrgRoles.some(r => { return r.role.name === 'Organization Admin' }))
        return appUserRoles

    throw createError({
        statusCode: 403,
        statusMessage: 'Forbidden: You must be a system admin or organization admin to view appuser-organization-roles.'
    })
})
