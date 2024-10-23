import { fork } from "~/server/data/orm.js"
import { z } from "zod"
import { Assumption } from "~/server/domain/requirements/index.js"

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
 * Updates an assumption by id.
 */
export default defineEventHandler(async (event) => {
    const { id } = await validateEventParams(event, paramSchema),
        { name, description, solutionId, isSilence } = await validateEventBody(event, bodySchema),
        { sessionUser, solution } = await assertSolutionContributor(event, solutionId),
        em = fork(),
        assumption = await assertReqBelongsToSolution(em, Assumption, id, solution)

    assumption.assign({
        name: name ?? assumption.name,
        description: description ?? assumption.description,
        isSilence: isSilence ?? assumption.isSilence,
        modifiedBy: sessionUser,
        lastModified: new Date()
    })

    await em.persistAndFlush(assumption)
})

