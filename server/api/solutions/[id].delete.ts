import { fork } from "~/server/data/orm"
import Solution from "~/server/domain/application/Solution"
import Organization from "~/server/domain/application/Organization";
import AppUserOrganizationRole from "~/server/domain/application/AppUserOrganizationRole";
import { getServerSession } from '#auth'
import AppRole from "~/server/domain/application/AppRole";
import { Collection } from "@mikro-orm/core";

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
        solution = await em.findOne(Solution, { id })

    if (!solution)
        throw createError({
            statusCode: 404,
            statusMessage: "Not Found: Solution not found."
        })

    const organization = await em.findOne(Organization, { id: solution.organization.id }),
        appUserOrgRoles = await em.find(AppUserOrganizationRole, { appUser: session.id, organization })

    // A solution can only be deleted by a system admin
    // or the associated organization admin
    if (session.isSystemAdmin || appUserOrgRoles.some(r => r.role === AppRole.ORGANIZATION_ADMIN)) {
        // for each property of the solution that is a collection, remove all items
        for (const key in solution) {
            const maybeCollection = Reflect.get(solution, key) as Collection<any>
            if (maybeCollection instanceof Collection)
                maybeCollection.removeAll()
        }
        await em.flush()
        await em.removeAndFlush(solution)
    } else {
        throw createError({
            statusCode: 403,
            statusMessage: "Forbidden: You must be a system admin or an organization admin to delete a solution."
        })
    }
})
