import orm from "~/server/data/orm"
import { z } from "zod"
import Effect from "~/server/domain/Effect"
import Solution from "~/server/domain/Solution"

const bodySchema = z.object({
    name: z.string().min(1),
    statement: z.string().min(1),
    solutionId: z.string().uuid()
})

/**
 * PUT /api/effects/:id
 *
 * Updates an effect by id.
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
        const effect = await orm.em.findOne(Effect, id),
            solution = await orm.em.findOne(Solution, body.data.solutionId)

        if (!effect)
            throw createError({
                statusCode: 400,
                statusMessage: `Bad Request: No effect found with id: ${id}`
            })
        if (!solution)
            throw createError({
                statusCode: 400,
                statusMessage: `Bad Request: No solution found with id: ${body.data.solutionId}`
            })

        effect.name = body.data.name
        effect.statement = body.data.statement
        effect.solution = solution

        await orm.em.flush()
    } else {
        throw createError({
            statusCode: 400,
            statusMessage: "Bad Request: id is required."
        })
    }
})