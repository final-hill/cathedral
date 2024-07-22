import { z } from "zod"
import { fork } from "~/server/data/orm"
import Obstacle from "~/server/domain/Obstacle"
import Solution from "~/server/domain/Solution"
import { type Uuid } from "~/server/domain/Uuid"

const bodySchema = z.object({
    name: z.string(),
    statement: z.string(),
    solutionId: z.string()
})

/**
 * PUT /api/obstacles/:id
 *
 * Updates an obstacle by id.
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
        const obstacle = await em.findOne(Obstacle, id as Uuid),
            solution = await em.findOne(Solution, body.data.solutionId as Uuid)

        if (!obstacle)
            throw createError({
                statusCode: 400,
                statusMessage: `Bad Request: No assumption found with id: ${id}`
            })
        if (!solution)
            throw createError({
                statusCode: 400,
                statusMessage: `Bad Request: No solution found with id: ${body.data.solutionId}`
            })

        obstacle.name = body.data.name
        obstacle.statement = body.data.statement
        obstacle.solution = solution

        await em.flush()
    } else {
        throw createError({
            statusCode: 400,
            statusMessage: "Bad Request: id is required."
        })
    }
})