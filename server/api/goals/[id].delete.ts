import GoalInteractor from "~/server/application/GoalInteractor"
import GoalRepository from "~/server/data/repositories/GoalRepository"
import { type Uuid } from "~/server/domain/Uuid"

/**
 * Delete goal by id.
 */
export default defineEventHandler(async (event) => {
    const id = event.context.params?.id,
        goalInteractor = new GoalInteractor(new GoalRepository())

    if (id) {
        goalInteractor.delete(id as Uuid)
    } else {
        throw createError({
            statusCode: 400,
            statusMessage: "Bad Request: id is required."
        })
    }
})
