import { z } from "zod"
import { fork } from "~/server/data/orm"
import { Limit } from "~/server/domain/requirements/index.js"

const paramSchema = z.object({
    id: z.string().uuid()
})

const bodySchema = z.object({
    solutionId: z.string().uuid()
})

/**
 * Delete limit by id.
 */
export default defineEventHandler(async (event) => {
    const { id } = await validateEventParams(event, paramSchema),
        { solutionId } = await validateEventBody(event, bodySchema),
        em = fork()

    await assertSolutionContributor(event, solutionId)

    em.remove(em.getReference(Limit, id))
    await em.flush()
})