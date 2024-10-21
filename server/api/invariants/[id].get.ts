import { z } from "zod"
import { fork } from "~/server/data/orm.js"
import { Invariant } from "~/server/domain/requirements/index.js"
import { Belongs } from "~/server/domain/relations"

const paramSchema = z.object({
    id: z.string().uuid()
})

const querySchema = z.object({
    solutionId: z.string().uuid(),
})

/**
 * Returns an invariant by id
 */
export default defineEventHandler(async (event) => {
    const { id } = await validateEventParams(event, paramSchema),
        { solutionId } = await validateEventQuery(event, querySchema),
        { solution } = await assertSolutionReader(event, solutionId),
        em = fork(),
        invariant = await assertReqBelongsToSolution(em, Invariant, id, solution)

    return invariant
})