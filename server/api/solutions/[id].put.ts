import { z } from "zod"
import { fork } from "~/server/data/orm"

const paramSchema = z.object({
    id: z.string().uuid()
})

const bodySchema = z.object({
    name: z.string().min(1).max(100),
    description: z.string()
})

/**
 * Updates a solution by id.
 */
export default defineEventHandler(async (event) => {
    const { id } = await validateEventParams(event, paramSchema),
        { description, name } = await validateEventBody(event, bodySchema),
        { solution } = await assertSolutionContributor(event, id),
        em = fork()

    Object.assign(solution, {
        name,
        description
    })

    await em.flush()
})