import { z } from "zod"
import { fork } from "~/server/data/orm"
import { NonFunctionalBehavior, MoscowPriority } from "~/server/domain/requirements/index.js"

const paramSchema = z.object({
    id: z.string().uuid()
})

const bodySchema = z.object({
    solutionId: z.string().uuid(),
    name: z.string().default("{Untitled Non-Functional Behavior}"),
    statement: z.string().default(""),
    priority: z.nativeEnum(MoscowPriority).optional()
})

/**
 * Updates a non functional behavior by id.
 */
export default defineEventHandler(async (event) => {
    const { id } = await validateEventParams(event, paramSchema),
        { name, priority, statement, solutionId } = await validateEventBody(event, bodySchema),
        { sessionUser } = await assertSolutionContributor(event, solutionId),
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