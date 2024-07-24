import { z } from "zod"
import { fork } from "~/server/data/orm"
import MoscowPriority from "~/server/domain/requirements/MoscowPriority"
import NonFunctionalBehavior from "~/server/domain/requirements/NonFunctionalBehavior"
import Solution from "~/server/domain/application/Solution"

const bodySchema = z.object({
    name: z.string().min(1),
    statement: z.string(),
    solutionId: z.string().uuid(),
    priority: z.nativeEnum(MoscowPriority)
})

/**
 * Updates a non functional behavior by id.
 */
export default defineEventHandler(async (event) => {
    const id = event.context.params?.id,
        body = await readValidatedBody(event, (b) => bodySchema.safeParse(b)),
        em = fork()

    if (!body.success)
        throw createError({
            statusCode: 400,
            statusMessage: 'Bad Request: Invalid body parameters',
            message: JSON.stringify(body.error.errors)
        })

    if (id) {
        const nonFunctionalBehavior = await em.findOne(NonFunctionalBehavior, id),
            solution = await em.findOne(Solution, body.data.solutionId)

        if (!nonFunctionalBehavior)
            throw createError({
                statusCode: 400,
                statusMessage: `Bad Request: No assumption found with id: ${id}`
            })
        if (!solution)
            throw createError({
                statusCode: 400,
                statusMessage: `Bad Request: No solution found with id: ${body.data.solutionId}`
            })

        nonFunctionalBehavior.name = body.data.name
        nonFunctionalBehavior.statement = body.data.statement
        nonFunctionalBehavior.solution = solution
        nonFunctionalBehavior.priority = body.data.priority

        await em.flush()
    } else {
        throw createError({
            statusCode: 400,
            statusMessage: "Bad Request: id is required."
        })
    }
})