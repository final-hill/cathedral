import { z } from "zod"
import { fork } from "~/server/data/orm.js"
import { Constraint } from "~/domain/requirements/index.js"

const paramSchema = z.object({
    id: z.string().uuid()
})

const bodySchema = z.object({
    solutionId: z.string().uuid()
})

/**
 * Delete constraint by id.
 */
export default defineEventHandler(async (event) => {
    const { id } = await validateEventParams(event, paramSchema),
        { solutionId } = await validateEventBody(event, bodySchema),
        { solution } = await assertSolutionContributor(event, solutionId),
        em = fork(),
        constraint = await assertReqBelongsToSolution(em, Constraint, id, solution)

    await deleteSolutionRequirement(em, constraint, solution)
})