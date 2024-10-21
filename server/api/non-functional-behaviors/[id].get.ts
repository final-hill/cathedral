import { z } from "zod"
import { fork } from "~/server/data/orm.js"
import { NonFunctionalBehavior } from "~/server/domain/requirements/index.js"
import { Belongs } from "~/server/domain/relations"

const paramSchema = z.object({
    id: z.string().uuid()
})

const querySchema = z.object({
    solutionId: z.string().uuid()
})

/**
 * Returns a non-functional behavior by id
 */
export default defineEventHandler(async (event) => {
    const { id } = await validateEventParams(event, paramSchema),
        { solutionId } = await validateEventQuery(event, querySchema),
        { solution } = await assertSolutionReader(event, solutionId),
        em = fork(),
        nonFunctionalBehavior = await assertReqBelongsToSolution(em, NonFunctionalBehavior, id, solution)

    return nonFunctionalBehavior
})