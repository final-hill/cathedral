import UserStoryInteractor from "~/server/application/UserStoryInteractor"
import UserStoryRepository from "~/server/data/repositories/UserStoryRepository"
import { type Uuid } from "~/server/domain/Uuid"

/**
 * Returns a User Story by id
 */
export default defineEventHandler(async (event) => {
    const id = event.context.params?.id,
        userStoryInteractor = new UserStoryInteractor(new UserStoryRepository())

    if (id) {
        const result = userStoryInteractor.get(id as Uuid)

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
