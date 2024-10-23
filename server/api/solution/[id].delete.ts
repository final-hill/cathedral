import { fork } from "~/server/data/orm.js"
import { z } from "zod"

const paramSchema = z.object({
    id: z.string().uuid()
})

/**
 * Delete a solution by id.
 */
export default defineEventHandler(async (event) => {
    const { id } = await validateEventParams(event, paramSchema),
        { solution } = await assertSolutionAdmin(event, id),
        em = fork()

    await em.removeAndFlush(solution)
})
