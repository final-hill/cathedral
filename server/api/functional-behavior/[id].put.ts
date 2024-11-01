import { z } from "zod"
import { FunctionalBehavior, functionalBehaviorReqIdPrefix, MoscowPriority } from "~/domain/requirements/index.js"
import { fork } from "~/server/data/orm.js"

const paramSchema = z.object({
    id: z.string().uuid()
})

const bodySchema = z.object({
    solutionId: z.string().uuid(),
    name: z.string().optional(),
    description: z.string().optional(),
    priority: z.nativeEnum(MoscowPriority).optional(),
    isSilence: z.boolean().optional()
})

/**
 * Updates a functional behavior by id.
 */
export default defineEventHandler(async (event) => {
    const { id } = await validateEventParams(event, paramSchema),
        { name, priority, description, solutionId, isSilence } = await validateEventBody(event, bodySchema),
        { sessionUser, solution } = await assertSolutionContributor(event, solutionId),
        em = fork(),
        functionalBehavior = await assertReqBelongsToSolution(em, FunctionalBehavior, id, solution)

    functionalBehavior.assign({
        name: name ?? functionalBehavior.name,
        description: description ?? functionalBehavior.description,
        priority: priority ?? functionalBehavior.priority,
        modifiedBy: sessionUser,
        lastModified: new Date(),
        ...(isSilence !== undefined && { isSilence })
    })

    // If the entity is no longer silent and has no reqId, assume
    // that it is a new requirement from the workbox
    if (isSilence !== undefined && isSilence == false && !functionalBehavior.reqId)
        functionalBehavior.reqId = await getNextReqId(functionalBehaviorReqIdPrefix, em, solution) as FunctionalBehavior['reqId']

    await em.persistAndFlush(functionalBehavior)
})