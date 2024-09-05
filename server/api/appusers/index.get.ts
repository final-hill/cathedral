import { z } from "zod"
import { fork } from "~/server/data/orm"
import AppUserOrganizationRole from "~/server/domain/application/AppUserOrganizationRole"
import { type Properties } from "~/server/domain/Properties"
import AppUser from "~/server/domain/application/AppUser"
import AppRole from "~/server/domain/application/AppRole"

const querySchema = z.object({
    organizationId: z.string().uuid(),
})

/**
 * Returns all appusers for the organization with their associated roles
 */
export default defineEventHandler(async (event) => {
    const { organizationId } = await validateEventQuery(event, querySchema),
        em = fork(),
        { organization } = await assertOrgAdmin(event, organizationId)

    const appUserOrganizationRoles = await em.findAll(AppUserOrganizationRole, {
        where: { organization },
        populate: ['appUser']
    })

    type AppUserRoles = Properties<AppUser> & { role: AppRole }

    // assign the roles to the appusers
    const appUsersWithRoles: AppUserRoles[] = appUserOrganizationRoles.map((a) => ({
        // @ts-expect-error: The entity is actually in an 'entity' property. Is this an ORM bug?
        ...a.appUser.entity,
        role: a.role
    }))

    return appUsersWithRoles
})