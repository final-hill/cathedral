import { z } from "zod"
import { fork } from "~/server/data/orm.js"
import { Assumption } from "~/domain/requirements"

const paramSchema = z.object({
    id: z.string().uuid()
})

const querySchema = z.object({
    solutionId: z.string().uuid()
})

/**
 * Returns an assumption associated with a solution
 */
export default defineEventHandler(async (event) => {
    const { id } = await validateEventParams(event, paramSchema),
        { solutionId } = await validateEventQuery(event, querySchema),
        { solution } = await assertSolutionReader(event, solutionId),
        em = fork(),
        assumption = await assertReqBelongsToSolution(em, Assumption, id, solution)

    return assumption
})