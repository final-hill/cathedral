import { fork } from "~/server/data/orm"
import Organization from "~/server/domain/application/Organization"
import AppUser from "~/server/domain/application/AppUser"
import AppUserOrganizationRole from "~/server/domain/application/AppUserOrganizationRole"

/**
 * Returns an organization by id
 */
export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig(),
        id = event.context.params?.id

    if (!id)
        throw createError({
            statusCode: 400,
            statusMessage: "Bad Request: id is required."
        })

    const em = fork(),
        session = await useSession(event, { password: config.sessionPassword }),
        [organization, appUser] = await Promise.all([
            em.findOne(Organization, id),
            em.findOne(AppUser, { id: session.id })
        ]),
        appUserOrgRoles = await em.find(AppUserOrganizationRole, { appUser, organization })

    // check if the user is a member of the organization or a system admin before returning it
    const result = appUser!.isSystemAdmin || appUserOrgRoles.length > 0 ? organization : null

    if (!result)
        throw createError({
            statusCode: 403,
            statusMessage: "Forbidden: You must be a member of the organization or a system admin to view it."
        })

    return result
})
