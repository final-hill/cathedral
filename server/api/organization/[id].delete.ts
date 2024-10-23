import { z } from "zod"
import { fork } from "~/server/data/orm.js"
import { AppUserOrganizationRole } from "~/server/domain/application/index.js"

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

    const appUserOrganizationRoles = await em.findAll(AppUserOrganizationRole, {
        where: { organization }
    })

    for (const auor of appUserOrganizationRoles)
        em.remove(auor)

    await em.removeAndFlush(organization)
})
