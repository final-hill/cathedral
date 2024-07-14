import { type Uuid } from "~/server/domain/Uuid"
import { z } from "zod"
import ObstacleRepository from "~/server/data/repositories/ObstacleRepository"
import ObstacleInteractor from "~/server/application/ObstacleInteractor"

const bodySchema = z.object({
    name: z.string().min(1),
    statement: z.string().min(1),
    solutionId: z.string().uuid()
})

/**
 * POST /api/obstacles
 *   body: {
 *     name: string,
 *     statement: string,
 *     solutionId: Uuid
 *   }
 *
 * Creates a new obstacle and returns its id
 */
export default defineEventHandler(async (event) => {
    const obstacleInteractor = new ObstacleInteractor(new ObstacleRepository()),
        body = await readValidatedBody(event, (b) => bodySchema.safeParse(b))

    if (!body.success)
        throw createError({
            statusCode: 400,
            statusMessage: "Bad Request: Invalid body parameters"
        })

    return obstacleInteractor.create({
        name: body.data.name,
        statement: body.data.statement,
        solutionId: body.data.solutionId as Uuid
    })
})