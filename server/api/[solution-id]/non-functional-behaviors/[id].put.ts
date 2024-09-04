import { z } from "zod"
import { fork } from "~/server/data/orm"
import { NonFunctionalBehavior, MoscowPriority } from "~/server/domain/requirements/index.js"

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
 * Updates a non functional behavior by id.
 */
export default defineEventHandler(async (event) => {
    const { id, solutionId } = await validateEventParams(event, paramSchema),
        { sessionUser } = await assertSolutionContributor(event, solutionId),
        { name, priority, statement } = await validateEventBody(event, bodySchema),
        em = fork()

    const nonFunctionalBehavior = await em.findOne(NonFunctionalBehavior, id)

    if (!nonFunctionalBehavior)
        throw createError({
            statusCode: 400,
            statusMessage: `Bad Request: No assumption found with id: ${id}`
        })

    nonFunctionalBehavior.name = name
    nonFunctionalBehavior.statement = statement
    nonFunctionalBehavior.priority = priority
    nonFunctionalBehavior.modifiedBy = sessionUser

    await em.flush()
})