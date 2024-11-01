import { z } from "zod"
import { fork } from "~/server/data/orm.js"
import { Invariant, invariantReqIdPrefix } from "~/domain/requirements/index.js"

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
 * Updates an invariant by id.
 */
export default defineEventHandler(async (event) => {
    const { id } = await validateEventParams(event, paramSchema),
        { name, description, solutionId, isSilence } = await validateEventBody(event, bodySchema),
        { sessionUser, solution } = await assertSolutionContributor(event, solutionId),
        em = fork(),
        invariant = await assertReqBelongsToSolution(em, Invariant, id, solution)

    invariant.assign({
        name: name ?? invariant.name,
        description: description ?? invariant.description,
        isSilence: isSilence ?? invariant.isSilence,
        modifiedBy: sessionUser,
        lastModified: new Date()
    })

    // If the entity is no longer silent and has no reqId, assume
    // that it is a new requirement from the workbox
    if (isSilence !== undefined && isSilence == false && !invariant.reqId)
        invariant.reqId = await getNextReqId(invariantReqIdPrefix, em, solution) as Invariant['reqId']

    await em.persistAndFlush(invariant)
})