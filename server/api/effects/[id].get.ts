import { z } from "zod"
import { fork } from "~/server/data/orm.js"
import { Effect } from "~/server/domain/requirements/index.js"
import { Belongs } from "~/server/domain/relations"

const paramSchema = z.object({
    id: z.string().uuid()
})

const querySchema = z.object({
    solutionId: z.string().uuid(),
})

/**
 * Returns an effect by id
 */
export default defineEventHandler(async (event) => {
    const { id } = await validateEventParams(event, paramSchema),
        { solutionId } = await validateEventQuery(event, querySchema),
        { solution } = await assertSolutionReader(event, solutionId),
        em = fork(),
        effect = await assertReqBelongsToSolution(em, Effect, id, solution)

    return effect
})