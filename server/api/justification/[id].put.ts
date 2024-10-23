import { fork } from "~/server/data/orm.js"
import { z } from "zod"
import { Justification } from "~/domain/requirements/index.js"

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
 * Updates a Justification by id.
 */
export default defineEventHandler(async (event) => {
    const { id } = await validateEventParams(event, paramSchema),
        { solutionId } = await validateEventBody(event, bodySchema),
        { sessionUser, solution } = await assertSolutionContributor(event, solutionId),
        { name, description, isSilence } = await validateEventBody(event, bodySchema),
        em = fork(),
        justification = await assertReqBelongsToSolution(em, Justification, id, solution)

    justification.assign({
        name: name ?? justification.name,
        description: description ?? justification.description,
        isSilence: isSilence ?? justification.isSilence,
        modifiedBy: sessionUser,
        lastModified: new Date()
    })

    await em.persistAndFlush(justification)
})