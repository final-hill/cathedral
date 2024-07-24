import { fork } from "~/server/data/orm"
import Organization from "~/server/domain/application/Organization"
import { getServerSession } from "#auth"
import AppUser from "~/server/domain/application/AppUser"
import AppUserOrganizationRole from "~/server/domain/application/AppUserOrganizationRole"

/**
 * Delete an organization by id.
 */
export default defineEventHandler(async (event) => {
    const id = event.context.params?.id;

    if (!id)
        throw createError({
            statusCode: 400,
            statusMessage: "Bad Request: id is required."
        })

    const em = fork(),
        session = (await getServerSession(event))!,
        organization = em.getReference(Organization, id),
        appUser = (await em.findOne(AppUser, { id: session.id }))!,
        appUserOrgRoles = await em.find(AppUserOrganizationRole, { appUser, organization })

    // An organization can only be deleted by a system admin
    // or the associated organization admin
    if (appUser.isSystemAdmin || appUserOrgRoles.some(r => r.role.name === 'Organization Admin')) {
        em.remove(organization)
        await em.flush()
    } else {
        throw createError({
            statusCode: 403,
            statusMessage: "Forbidden: You must be a system admin or an organization admin to delete an organization."
        })
    }
})
