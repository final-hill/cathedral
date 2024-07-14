import ObstacleInteractor from "~/server/application/ObstacleInteractor"
import ObstacleRepository from "~/server/data/repositories/ObstacleRepository"
import { type Uuid } from "~/server/domain/Uuid"

/**
 * Delete obstacle by id.
 */
export default defineEventHandler(async (event) => {
    const id = event.context.params?.id,
        obstacleInteractor = new ObstacleInteractor(new ObstacleRepository())

    if (id) {
        obstacleInteractor.delete(id as Uuid)
    } else {
        throw createError({
            statusCode: 400,
            statusMessage: "Bad Request: id is required."
        })
    }
})
