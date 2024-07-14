import GoalInteractor from "~/server/application/GoalInteractor"
import GoalRepository from "~/server/data/repositories/GoalRepository"
import { type Uuid } from "~/server/domain/Uuid"

/**
 * Returns a goal by id
 */
export default defineEventHandler(async (event) => {
    const id = event.context.params?.id,
        goalInteractor = new GoalInteractor(new GoalRepository())

    if (id) {
        const result = goalInteractor.get(id as Uuid)

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
