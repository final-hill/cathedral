import { z } from "zod"
import { fork } from "~/server/data/orm"
import AppUserOrganizationRole from "~/server/domain/application/AppUserOrganizationRole"
import { getServerSession } from "#auth"
import AppUser from "~/server/domain/application/AppUser"

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
    const [query, session] = await Promise.all([
        getValidatedQuery(event, (q) => querySchema.safeParse(q)),
        getServerSession(event)
    ])

    if (!query.success)
        throw createError({
            statusCode: 400,
            statusMessage: "Bad Request: Invalid query parameters",
            message: JSON.stringify(query.error.errors)
        })

    const em = fork(),
        sessionUser = await em.findOne(AppUser, { id: session!.id })

    let appUserRolesQuery = em.createQueryBuilder(AppUserOrganizationRole)
        .select('*')
        .where('organization_id = ?', [query.data.organizationId])
    if (query.data.appUserId)
        appUserRolesQuery = appUserRolesQuery.andWhere('app_user_id = ?', [query.data.appUserId])
    if (query.data.roleName)
        appUserRolesQuery = appUserRolesQuery.andWhere('role_name = ?', [query.data.roleName])

    const sessionUserOrgRoles = await em.find(AppUserOrganizationRole, {
        appUser: { id: sessionUser!.id },
        organization: { id: query.data.organizationId },
    })

    // If the user is a system admin or an organization admin, return all appuser-organization-roles
    // filtered by the query parameters
    if (sessionUser!.isSystemAdmin || sessionUserOrgRoles.some(r => { return r.role.name === 'Organization Admin' }))
        return appUserRolesQuery.execute('all')

    throw createError({
        statusCode: 403,
        statusMessage: 'Forbidden: You must be a system admin or organization admin to view appuser-organization-roles.'
    })
})