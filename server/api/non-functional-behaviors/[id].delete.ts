import { z } from "zod"
import { fork } from "~/server/data/orm.js"
import { NonFunctionalBehavior } from "~/server/domain/index.js"

const paramSchema = z.object({
    id: z.string().uuid()
})

const bodySchema = z.object({
    solutionId: z.string().uuid()
})

/**
 * Delete non-functional behavior by id.
 */
export default defineEventHandler(async (event) => {
    const { id } = await validateEventParams(event, paramSchema),
        { solutionId } = await validateEventBody(event, bodySchema),
        em = fork()

    await assertSolutionContributor(event, solutionId)

    em.remove(em.getReference(NonFunctionalBehavior, id))
    await em.flush()
})