import { z } from "zod"
import { FunctionalBehavior, MoscowPriority } from "~/server/domain/requirements/index.js"
import { fork } from "~/server/data/orm"

const paramSchema = z.object({
    id: z.string().uuid()
})

const bodySchema = z.object({
    solutionId: z.string().uuid(),
    name: z.string().default("{Untitled Functional Behavior}"),
    statement: z.string().default(""),
    priority: z.nativeEnum(MoscowPriority)
})

/**
 * Updates a functional behavior by id.
 */
export default defineEventHandler(async (event) => {
    const { id } = await validateEventParams(event, paramSchema),
        { name, priority, statement, solutionId } = await validateEventBody(event, bodySchema),
        { sessionUser } = await assertSolutionContributor(event, solutionId),
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