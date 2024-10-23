import { z } from "zod"
import { fork } from "~/server/data/orm.js"
import { Outcome } from "~/server/domain/requirements/index.js"

const paramSchema = z.object({
    id: z.string().uuid()
})

const bodySchema = z.object({
    solutionId: z.string().uuid(),
    name: z.string().optional(),
    description: z.string().optional(),
    isSilence: z.boolean().optional()
})

/**
 * Updates an outcome by id.
 */
export default defineEventHandler(async (event) => {
    const { id } = await validateEventParams(event, paramSchema),
        { name, description, solutionId, isSilence } = await validateEventBody(event, bodySchema),
        { sessionUser, solution } = await assertSolutionContributor(event, solutionId),
        em = fork(),
        outcome = await assertReqBelongsToSolution(em, Outcome, id, solution)

    outcome.assign({
        name: name ?? outcome.name,
        description: description ?? outcome.description,
        isSilence: isSilence ?? outcome.isSilence,
        modifiedBy: sessionUser,
        lastModified: new Date()
    })

    await em.persistAndFlush(outcome)
})