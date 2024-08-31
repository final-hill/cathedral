import { fork } from "~/server/data/orm"
import { z } from "zod"
import { Assumption } from "~/server/domain/requirements/index"
import Solution from "~/server/domain/application/Solution"

const bodySchema = z.object({
    name: z.string().min(1),
    statement: z.string(),
    solutionId: z.string().uuid()
})

/**
 * PUT /api/assumptions/:id
 *
 * Updates an assumption by id.
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
        const assumption = await em.findOne(Assumption, id),
            solution = await em.findOne(Solution, body.data.solutionId)

        if (!assumption)
            throw createError({
                statusCode: 400,
                statusMessage: `Bad Request: No assumption found with id: ${id}`
            })
        if (!solution)
            throw createError({
                statusCode: 400,
                statusMessage: `Bad Request: No solution found with id: ${body.data.solutionId}`
            })

        assumption.name = body.data.name
        assumption.statement = body.data.statement
        assumption.solution = solution

        await em.flush()
    } else {
        throw createError({
            statusCode: 400,
            statusMessage: "Bad Request: id is required."
        })
    }
})