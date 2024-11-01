import { z } from "zod"
import { fork } from "~/server/data/orm.js"
import { Epic } from "~/domain/requirements/index.js"

const paramSchema = z.object({
    id: z.string().uuid()
})

const bodySchema = z.object({
    solutionId: z.string().uuid()
})

/**
 * Delete an epic by id.
 */
export default defineEventHandler(async (event) => {
    const { id } = await validateEventParams(event, paramSchema),
        { solutionId } = await validateEventBody(event, bodySchema),
        { solution } = await assertSolutionContributor(event, solutionId),
        em = fork(),
        epic = await assertReqBelongsToSolution(em, Epic, id, solution)

    await deleteSolutionRequirement(em, epic, solution)
})