import { z } from "zod"
import { FunctionalBehavior, MoscowPriority } from "~/server/domain/index.js"
import { fork } from "~/server/data/orm.js"

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
 * Updates a functional behavior by id.
 */
export default defineEventHandler(async (event) => {
    const { id } = await validateEventParams(event, paramSchema),
        { name, priority, statement, solutionId, isSilence } = await validateEventBody(event, bodySchema),
        { sessionUser } = await assertSolutionContributor(event, solutionId),
        em = fork(),
        functionalBehavior = await em.findOne(FunctionalBehavior, id)

    if (!functionalBehavior)
        throw createError({
            statusCode: 400,
            statusMessage: `Bad Request: No effect found with id: ${id}`
        })

    Object.assign(functionalBehavior, {
        name: name ?? functionalBehavior.name,
        statement: statement ?? functionalBehavior.statement,
        priority: priority ?? functionalBehavior.priority,
        modifiedBy: sessionUser,
        lastModified: new Date(),
        ...(isSilence !== undefined && { isSilence })
    })

    await em.persistAndFlush(functionalBehavior)
})