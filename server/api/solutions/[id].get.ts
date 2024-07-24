import { fork } from "~/server/data/orm"
import Solution from "~/server/domain/application/Solution"
import { getServerSession } from "#auth"
import AppUser from "~/server/domain/application/AppUser"
import Organization from "~/server/domain/application/Organization"
import AppUserOrganizationRole from "~/server/domain/application/AppUserOrganizationRole"

/**
 * Returns a solution by id
 */
export default defineEventHandler(async (event) => {
    const id = event.context.params?.id

    if (!id)
        throw createError({
            statusCode: 400,
            statusMessage: "Bad Request: id is required."
        })

    const em = fork(),
        session = (await getServerSession(event))!,
        [appUser, solution] = await Promise.all([
            em.findOne(AppUser, { id: session.id }),
            em.findOne(Solution, { id })
        ])

    if (!solution)
        throw createError({
            statusCode: 404,
            statusMessage: `Item not found with the given id: ${id}`
        })

    const organization = await em.findOne(Organization, { id: solution.organization.id }),
        appUserOrgRoles = await em.find(AppUserOrganizationRole, { appUser, organization })

    // check if the user is a member of the organization or a system admin before returning it
    const result = appUser!.isSystemAdmin || appUserOrgRoles.length > 0 ? solution : null

    if (!result)
        throw createError({
            statusCode: 403,
            statusMessage: "Forbidden: You must be a member of the organization or a system admin to view this item."
        })

    return result
})
