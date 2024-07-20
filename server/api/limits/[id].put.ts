import { z } from "zod"
import orm from "~/server/data/orm"
import Limit from "~/server/domain/Limit"
import Solution from "~/server/domain/Solution"

const bodySchema = z.object({
    name: z.string(),
    statement: z.string(),
    solutionId: z.string()
})

/**
 * PUT /api/limits/:id
 *
 * Updates a limit by id.
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
        const limit = await orm.em.findOne(Limit, id),
            solution = await orm.em.findOne(Solution, body.data.solutionId)

        if (!limit)
            throw createError({
                statusCode: 400,
                statusMessage: `Bad Request: No assumption found with id: ${id}`
            })
        if (!solution)
            throw createError({
                statusCode: 400,
                statusMessage: `Bad Request: No solution found with id: ${body.data.solutionId}`
            })

        limit.name = body.data.name
        limit.statement = body.data.statement
        limit.solution = solution

        await orm.em.flush()
    } else {
        throw createError({
            statusCode: 400,
            statusMessage: "Bad Request: id is required."
        })
    }
})