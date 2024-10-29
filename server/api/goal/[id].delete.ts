import { z } from "zod"
import { fork } from "~/server/data/orm.js"
import { Goal } from "~/domain/requirements/index.js"

const paramSchema = z.object({
    id: z.string().uuid()
})

const bodySchema = z.object({
    solutionId: z.string().uuid()
})

/**
 * Delete a goal by id.
 */
export default defineEventHandler(async (event) => {
    const { id } = await validateEventParams(event, paramSchema),
        { solutionId } = await validateEventBody(event, bodySchema),
        { solution } = await assertSolutionContributor(event, solutionId),
        em = fork(),
        goal = await assertReqBelongsToSolution(em, Goal, id, solution)

    await em.removeAndFlush(goal)
})