import { fork } from "~/server/data/orm"
import { z } from "zod"
import Solution from "~/server/domain/Solution"
import Justification from "~/server/domain/Justification"
import { type Uuid } from "~/server/domain/Uuid"

const bodySchema = z.object({
    name: z.string().min(1),
    statement: z.string(),
    solutionId: z.string().uuid()
})

/**
 * PUT /api/justifications/:id
 *
 * Updates a Justification by id.
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
        const justification = await em.findOne(Justification, id as Uuid),
            solution = await em.findOne(Solution, body.data.solutionId as Uuid)

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

        await em.flush()
    } else {
        throw createError({
            statusCode: 400,
            statusMessage: "Bad Request: id is required."
        })
    }
})