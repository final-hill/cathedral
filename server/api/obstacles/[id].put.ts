import { type Uuid } from "~/server/domain/Uuid"
import { z } from "zod"
import ObstacleRepository from "~/server/data/repositories/ObstacleRepository"
import ObstacleInteractor from "~/server/application/ObstacleInteractor"

const bodySchema = z.object({
    name: z.string(),
    statement: z.string(),
    solutionId: z.string()
})

/**
 * PUT /api/obstacles/:id
 *   body: {
 *     name: string,
 *     statement: string
 *     solutionId: Uuid
 *   }
 *
 * Updates an obstacle by id.
 */
export default defineEventHandler(async (event) => {
    const id = event.context.params?.id,
        obstacleInteractor = new ObstacleInteractor(new ObstacleRepository()),
        body = await readValidatedBody(event, (b) => bodySchema.safeParse(b))

    if (!body.success)
        throw createError({
            statusCode: 400,
            statusMessage: "Bad Request: Invalid body parameters"
        })

    if (id) {
        return obstacleInteractor.update({
            id: id as Uuid,
            name: body.data.name,
            statement: body.data.statement,
            solutionId: body.data.solutionId as Uuid
        })
    } else {
        throw createError({
            statusCode: 400,
            statusMessage: "Bad Request: id is required."
        })
    }
})