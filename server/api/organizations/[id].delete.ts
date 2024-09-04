import { z } from "zod"
import { fork } from "~/server/data/orm"

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
    organization.solutions.removeAll()

    await em.persistAndFlush(organization)

    em.remove(organization)
    await em.persistAndFlush(organization)
})
