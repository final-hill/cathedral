import { z } from "zod"
import { fork } from "~/server/data/orm.js"
import { NonFunctionalBehavior, MoscowPriority } from "~/domain/requirements/index.js"

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
 * Updates a non functional behavior by id.
 */
export default defineEventHandler(async (event) => {
    const { id } = await validateEventParams(event, paramSchema),
        { name, priority, description, solutionId, isSilence } = await validateEventBody(event, bodySchema),
        { sessionUser, solution } = await assertSolutionContributor(event, solutionId),
        em = fork(),
        nonFunctionalBehavior = await assertReqBelongsToSolution(em, NonFunctionalBehavior, id, solution)

    nonFunctionalBehavior.assign({
        name: name ?? nonFunctionalBehavior.name,
        description: description ?? nonFunctionalBehavior.description,
        priority: priority ?? nonFunctionalBehavior.priority,
        isSilence: isSilence ?? nonFunctionalBehavior.isSilence,
        modifiedBy: sessionUser,
        lastModified: new Date()
    })

    await em.persistAndFlush(nonFunctionalBehavior)
})