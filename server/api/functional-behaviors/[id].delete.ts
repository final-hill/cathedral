import { z } from "zod"
import { fork } from "~/server/data/orm.js"
import { FunctionalBehavior } from "~/server/domain/requirements/index.js"

const paramSchema = z.object({
    id: z.string().uuid()
})

const bodySchema = z.object({
    solutionId: z.string().uuid()
})

/**
 * Delete an functional behavior by id.
 */
export default defineEventHandler(async (event) => {
    const { id } = await validateEventParams(event, paramSchema),
        { solutionId } = await validateEventBody(event, bodySchema),
        { solution } = await assertSolutionContributor(event, solutionId),
        em = fork(),
        functionalBehavior = await assertReqBelongsToSolution(em, FunctionalBehavior, id, solution)

    await em.removeAndFlush(functionalBehavior)
})