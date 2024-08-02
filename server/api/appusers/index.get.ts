import { z } from "zod"
import { fork } from "~/server/data/orm"
import AppUser from "~/server/domain/application/AppUser"
import AppUserOrganizationRole from "~/server/domain/application/AppUserOrganizationRole"
import Organization from "~/server/domain/application/Organization"

const querySchema = z.object({
    organizationId: z.string().uuid(),
})

/**
 * GET /api/appusers?organizationId
 *
 * Returns all appusers for the organization with their associated roles
 */
export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig(),
        [query, session] = await Promise.all([
            getValidatedQuery(event, (q) => querySchema.safeParse(q)),
            useSession(event, { password: config.sessionPassword })
        ])

    if (!query.success)
        throw createError({
            statusCode: 400,
            statusMessage: "Bad Request: Invalid query parameters",
            message: JSON.stringify(query.error.errors)
        })

    const em = fork(),
        sessionUser = (await em.findOne(AppUser, { id: session.id }))!,
        organization = await em.findOne(Organization, { id: query.data.organizationId }),
        sessionUserOrg = await em.findOne(AppUserOrganizationRole, { appUser: sessionUser, organization })

    if (!organization)
        throw createError({
            statusCode: 404,
            statusMessage: "Not Found",
            message: "Organization not found for the given ID"
        })

    // If the user is not associated with the organization
    // or is not a system admin, return a 403
    if (!sessionUserOrg && !sessionUser.isSystemAdmin)
        throw createError({
            statusCode: 403,
            statusMessage: "Forbidden",
            message: "You are not associated with the organization."
        })

    type ResponseType = {
        id: string
        name?: string
        roles: string[]
        creationDate?: Date
        isSystemAdmin?: boolean
    }

    const appUserOrganizationRoles = await em.find(AppUserOrganizationRole, { organization })
    // group the appUserOrganizationRoles by appUser with the roles grouped in the user as an array
    const users = appUserOrganizationRoles.map((a) => ({ id: a.appUser.id, role: a.role }))
        .reduce((acc, cur) => {
            const groupedUser = acc.get(cur.id) ?? { id: cur.id, roles: [] }
            groupedUser.roles.push(cur.role.name)
            acc.set(cur.id, groupedUser)
            return acc
        }, new Map<string, ResponseType>())

    // load the associated appUsers and assign the creationDate and isSystemAdmin properties
    const appUsers = await em.find(AppUser, { id: [...users.keys()] })
    appUsers.forEach((u) => {
        const user = users.get(u.id)
        if (user) {
            user.name = u.name
            user.creationDate = u.creationDate
            user.isSystemAdmin = u.isSystemAdmin
        }
    })

    return [...users.values()]
})
