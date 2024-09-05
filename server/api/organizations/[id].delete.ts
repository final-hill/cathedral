import { Collection } from "@mikro-orm/core"
import { z } from "zod"
import { fork } from "~/server/data/orm"
import AppUserOrganizationRole from "~/server/domain/application/AppUserOrganizationRole"

const paramSchema = z.object({
    id: z.string().uuid()
})

/**
 * Delete an organization by id.
 */
export default defineEventHandler(async (event) => {
    const { id } = await validateEventParams(event, paramSchema),
        { organization } = await assertOrgAdmin(event, id),
        em = fork()

    const solutions = await organization.solutions.load()

    for (const solution of solutions) {
        // for each property of the solution that is a collection, remove all items
        for (const key in solution) {
            const maybeCollection = Reflect.get(solution, key) as Collection<any>
            if (maybeCollection instanceof Collection) {
                await maybeCollection.load()
                maybeCollection.getItems().map(item => em.remove(item))
                maybeCollection.removeAll()
            }
        }
        await em.flush()
        await em.removeAndFlush(solution)
    }

    organization.solutions.removeAll()

    const appUserOrganizationRoles = await em.findAll(AppUserOrganizationRole, {
        where: { organization }
    })

    for (const auor of appUserOrganizationRoles)
        em.remove(auor)

    em.remove(organization)

    await em.removeAndFlush(organization)
})
