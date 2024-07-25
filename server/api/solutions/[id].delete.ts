import { fork } from "~/server/data/orm"
import Solution from "~/server/domain/application/Solution"
import { getServerSession } from "#auth"
import Organization from "~/server/domain/application/Organization";
import AppUser from "~/server/domain/application/AppUser";
import AppUserOrganizationRole from "~/server/domain/application/AppUserOrganizationRole";

/**
 * Delete a solution by id.
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
        [appUser, solution] = await Promise.all([
            em.findOne(AppUser, { id: session.id }),
            em.findOne(Solution, { id })
        ])

    if (!solution)
        throw createError({
            statusCode: 404,
            statusMessage: "Not Found: Solution not found."
        })

    const organization = await em.findOne(Organization, { id: solution.organization.id }),
        appUserOrgRoles = await em.find(AppUserOrganizationRole, { appUser, organization })

    // A solution can only be deleted by a system admin
    // or the associated organization admin

    if (appUser!.isSystemAdmin || appUserOrgRoles.some(r => r.role.name === 'Organization Admin')) {
        em.remove(solution)
        await em.flush()
    } else {
        throw createError({
            statusCode: 403,
            statusMessage: "Forbidden: You must be a system admin or an organization admin to delete a solution."
        })
    }
})
