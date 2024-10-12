import { z } from "zod"
import { fork } from "~/server/data/orm.js"
import { NonFunctionalBehavior, MoscowPriority } from "~/server/domain/index.js"

const paramSchema = z.object({
    id: z.string().uuid()
})

const bodySchema = z.object({
    solutionId: z.string().uuid(),
    name: z.string().optional(),
    statement: z.string().optional(),
    priority: z.nativeEnum(MoscowPriority).optional(),
    isSilence: z.boolean().optional()
})

/**
 * Updates a non functional behavior by id.
 */
export default defineEventHandler(async (event) => {
    const { id } = await validateEventParams(event, paramSchema),
        { name, priority, statement, solutionId, isSilence } = await validateEventBody(event, bodySchema),
        { sessionUser } = await assertSolutionContributor(event, solutionId),
        em = fork(),
        nonFunctionalBehavior = await em.findOne(NonFunctionalBehavior, id)

    if (!nonFunctionalBehavior)
        throw createError({
            statusCode: 400,
            statusMessage: `Bad Request: No assumption found with id: ${id}`
        })

    Object.assign(nonFunctionalBehavior, {
        name: name ?? nonFunctionalBehavior.name,
        statement: statement ?? nonFunctionalBehavior.statement,
        priority: priority ?? nonFunctionalBehavior.priority,
        isSilence: isSilence ?? nonFunctionalBehavior.isSilence,
        modifiedBy: sessionUser,
        lastModified: new Date(),
    })

    await em.persistAndFlush(nonFunctionalBehavior)
})