import { z } from "zod"
import { FunctionalBehavior, MoscowPriority } from "~/server/domain/requirements/index.js"
import { fork } from "~/server/data/orm"

const paramSchema = z.object({
    solutionId: z.string().uuid(),
    id: z.string().uuid()
})

const bodySchema = z.object({
    name: z.string().min(1),
    statement: z.string(),
    priority: z.nativeEnum(MoscowPriority)
})

/**
 * Updates a functional behavior by id.
 */
export default defineEventHandler(async (event) => {
    const { id, solutionId } = await validateEventParams(event, paramSchema),
        { sessionUser } = await assertSolutionContributor(event, solutionId),
        { name, priority, statement } = await validateEventBody(event, bodySchema),
        em = fork()

    const functionalBehavior = await em.findOne(FunctionalBehavior, id)

    if (!functionalBehavior)
        throw createError({
            statusCode: 400,
            statusMessage: `Bad Request: No effect found with id: ${id}`
        })

    functionalBehavior.name = name
    functionalBehavior.statement = statement
    functionalBehavior.priority = priority
    functionalBehavior.modifiedBy = sessionUser

    await em.flush()
})