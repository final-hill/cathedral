import { z } from "zod"
import { fork } from "~/server/data/orm"
import AppUserOrganizationRole from "~/server/domain/application/AppUserOrganizationRole"
import AppUser from "~/server/domain/application/AppUser"

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

    // assign the roles to the appusers
    const appUsersWithRoles: AppUser[] = appUserOrganizationRoles.map((aur) => {
        const appUser = aur.appUser as AppUser
        appUser.role = aur.role
        return appUser
    })

    return appUsersWithRoles
})