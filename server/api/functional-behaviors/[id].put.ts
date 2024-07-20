import { z } from "zod"
import MoscowPriority from "~/server/domain/MoscowPriority"
import orm from "~/server/data/orm"
import FunctionalBehavior from "~/server/domain/FunctionalBehavior"
import Solution from "~/server/domain/Solution"

const bodySchema = z.object({
    name: z.string().min(1),
    statement: z.string().min(1),
    solutionId: z.string().uuid(),
    priority: z.nativeEnum(MoscowPriority)
})

/**
 * Updates a functional behavior by id.
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
        const functionalBehavior = await orm.em.findOne(FunctionalBehavior, id),
            solution = await orm.em.findOne(Solution, body.data.solutionId)

        if (!functionalBehavior)
            throw createError({
                statusCode: 400,
                statusMessage: `Bad Request: No effect found with id: ${id}`
            })
        if (!solution)
            throw createError({
                statusCode: 400,
                statusMessage: `Bad Request: No solution found with id: ${body.data.solutionId}`
            })

        functionalBehavior.name = body.data.name
        functionalBehavior.statement = body.data.statement
        functionalBehavior.solution = solution
        functionalBehavior.priority = body.data.priority

        await orm.em.flush()
    } else {
        throw createError({
            statusCode: 400,
            statusMessage: "Bad Request: id is required."
        })
    }
})