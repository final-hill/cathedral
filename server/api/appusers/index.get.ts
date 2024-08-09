import { z } from "zod"
import { getServerSession } from '#auth'
import { fork } from "~/server/data/orm"
import Organization from "~/server/domain/application/Organization"
import AppUserOrganizationRole from "~/server/domain/application/AppUserOrganizationRole"
import { type Properties } from "~/server/domain/Properties"
import AppUser from "~/server/domain/application/AppUser"
import AppRole from "~/server/domain/application/AppRole"

const querySchema = z.object({
    organizationId: z.string().uuid(),
})

/**
 * GET /api/appusers?organizationId
 *
 * Returns all appusers for the organization with their associated roles
 */
export default defineEventHandler(async (event) => {
    const query = await getValidatedQuery(event, (q) => querySchema.safeParse(q)),
        session = (await getServerSession(event))!,
        em = fork()

    if (!query.success)
        throw createError({
            statusCode: 400,
            statusMessage: "Bad Request: Invalid query parameters",
            message: JSON.stringify(query.error.errors)
        })

    const organization = await em.findOne(Organization, { id: query.data.organizationId }),
        sessionUserOrg = await em.findOne(AppUserOrganizationRole, {
            appUser: session.id,
            organization
        })

    if (!organization)
        throw createError({
            statusCode: 404,
            statusMessage: "Not Found",
            message: "Organization not found for the given ID"
        })

    // If the user is not associated with the organization
    // or is not a system admin, return a 403

    if (!sessionUserOrg && !session.isSystemAdmin)
        throw createError({
            statusCode: 403,
            statusMessage: "Forbidden",
            message: "You are not associated with the organization."
        })

    const appUserOrganizationRoles = await em.findAll(AppUserOrganizationRole, {
        where: { organization },
        populate: ['appUser']
    })

    type AppUserRoles = Properties<AppUser> & { role: AppRole }

    // assign the roles to the appusers
    const appUsersWithRoles: AppUserRoles[] = appUserOrganizationRoles.map((a) => ({
        // @ts-expect-error: The entity is actuall in an 'entity' property. Is this an ORM bug?
        ...a.appUser.entity,
        role: a.role
    }))

    return appUsersWithRoles
})