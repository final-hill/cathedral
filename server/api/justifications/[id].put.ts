import orm from "~/server/data/orm"
import { z } from "zod"
import Solution from "~/server/domain/Solution"
import Justification from "~/server/domain/Justification"

const bodySchema = z.object({
    name: z.string().min(1),
    statement: z.string().min(1),
    solutionId: z.string().uuid()
})

/**
 * PUT /api/justifications/:id
 *
 * Updates a Justification by id.
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
        const justification = await orm.em.findOne(Justification, id),
            solution = await orm.em.findOne(Solution, body.data.solutionId)

        if (!justification)
            throw createError({
                statusCode: 400,
                statusMessage: `Bad Request: No assumption found with id: ${id}`
            })
        if (!solution)
            throw createError({
                statusCode: 400,
                statusMessage: `Bad Request: No solution found with id: ${body.data.solutionId}`
            })

        justification.name = body.data.name
        justification.statement = body.data.statement
        justification.solution = solution

        await orm.em.flush()
    } else {
        throw createError({
            statusCode: 400,
            statusMessage: "Bad Request: id is required."
        })
    }
})