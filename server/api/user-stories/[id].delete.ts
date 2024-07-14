import UserStoryInteractor from "~/server/application/UserStoryInteractor"
import UserStoryRepository from "~/server/data/repositories/UserStoryRepository"
import { type Uuid } from "~/server/domain/Uuid"

/**
 * Delete User Story by id.
 */
export default defineEventHandler(async (event) => {
    const id = event.context.params?.id,
        userStoryInteractor = new UserStoryInteractor(new UserStoryRepository())

    if (id) {
        userStoryInteractor.delete(id as Uuid)
    } else {
        throw createError({
            statusCode: 400,
            statusMessage: "Bad Request: id is required."
        })
    }
})
