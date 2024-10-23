import { z } from "zod"
import { fork } from "~/server/data/orm.js"
import { Stakeholder } from "~/server/domain/requirements/index.js"

const paramSchema = z.object({
    id: z.string().uuid()
})

const querySchema = z.object({
    solutionId: z.string().uuid()
})

/**
 * Returns a stakeholder by id
 */
export default defineEventHandler(async (event) => {
    const { id } = await validateEventParams(event, paramSchema),
        { solutionId } = await validateEventQuery(event, querySchema),
        { solution } = await assertSolutionReader(event, solutionId),
        em = fork(),
        stakeholder = await assertReqBelongsToSolution(em, Stakeholder, id, solution)

    return stakeholder
})