import { z } from "zod"
import orm from "~/server/data/orm"
import MoscowPriority from "~/server/domain/MoscowPriority"
import NonFunctionalBehavior from "~/server/domain/NonFunctionalBehavior"
import Solution from "~/server/domain/Solution"

const bodySchema = z.object({
    name: z.string().min(1),
    statement: z.string().min(1),
    solutionId: z.string().uuid(),
    priority: z.nativeEnum(MoscowPriority)
})

/**
 * Updates a non functional behavior by id.
 */
export default defineEventHandler(async (event) => {
    const id = event.context.params?.id,
        body = await readValidatedBody(event, (b) => bodySchema.safeParse(b))

    if (!body.success)
        throw createError({
            statusCode: 400,
            statusMessage: "Bad Request: Invalid body parameters"
        })

    if (id) {
        const nonFunctionalBehavior = await orm.em.findOne(NonFunctionalBehavior, id),
            solution = await orm.em.findOne(Solution, body.data.solutionId)

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

        await orm.em.flush()
    } else {
        throw createError({
            statusCode: 400,
            statusMessage: "Bad Request: id is required."
        })
    }
})