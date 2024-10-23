import { z } from "zod"
import { fork } from "~/server/data/orm.js"
import { Justification } from "~/server/domain/requirements/index.js"

const paramSchema = z.object({
    id: z.string().uuid()
})

const querySchema = z.object({
    solutionId: z.string().uuid()
})

/**
 * Returns a justification by id
 */
export default defineEventHandler(async (event) => {
    const { id } = await validateEventParams(event, paramSchema),
        { solutionId } = await validateEventQuery(event, querySchema),
        { solution } = await assertSolutionReader(event, solutionId),
        em = fork(),
        justification = await assertReqBelongsToSolution(em, Justification, id, solution)

    return justification
})