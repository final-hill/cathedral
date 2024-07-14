import ObstacleInteractor from "~/server/application/ObstacleInteractor"
import ObstacleRepository from "~/server/data/repositories/ObstacleRepository"
import { type Uuid } from "~/server/domain/Uuid"

/**
 * Returns a obstacle by id
 */
export default defineEventHandler(async (event) => {
    const id = event.context.params?.id,
        obstacleInteractor = new ObstacleInteractor(new ObstacleRepository())

    if (id) {
        const result = obstacleInteractor.get(id as Uuid)

        if (result)
            return result
        else
            throw createError({
                statusCode: 404,
                statusMessage: `Item not found with the given id: ${id}`
            })
    } else {
        throw createError({
            statusCode: 400,
            statusMessage: "Bad Request: id is required."
        })
    }
})
