import { z } from "zod"
import { fork } from "~/server/data/orm.js"
import { Assumption } from "~/server/domain/requirements/index.js"

const paramSchema = z.object({
    id: z.string().uuid()
})

const bodySchema = z.object({
    solutionId: z.string().uuid()
})

/**
 * Delete an assumption associated with a solution
 */
export default defineEventHandler(async (event) => {
    const { id } = await validateEventParams(event, paramSchema),
        { solutionId } = await validateEventBody(event, bodySchema),
        { solution } = await assertSolutionContributor(event, solutionId),
        em = fork(),
        assumption = await assertReqBelongsToSolution(em, Assumption, id, solution)

    await em.removeAndFlush(assumption)
})