import { z } from "zod"
import { fork } from "~/server/data/orm.js"
import { Constraint } from "~/domain/requirements/Constraint.js"

const paramSchema = z.object({
    id: z.string().uuid()
})

const querySchema = z.object({
    solutionId: z.string().uuid()
})

/**
 * Returns a constraint by id
 */
export default defineEventHandler(async (event) => {
    const { id } = await validateEventParams(event, paramSchema),
        { solutionId } = await validateEventQuery(event, querySchema),
        { solution } = await assertSolutionReader(event, solutionId),
        em = fork(),
        constraint = await assertReqBelongsToSolution(em, Constraint, id, solution)

    return constraint
})