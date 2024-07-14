import LimitInteractor from "~/server/application/LimitInteractor"
import LimitRepository from "~/server/data/repositories/LimitRepository"
import { type Uuid } from "~/server/domain/Uuid"

/**
 * Returns a limit by id
 */
export default defineEventHandler(async (event) => {
    const id = event.context.params?.id,
        limitInteractor = new LimitInteractor(new LimitRepository())

    if (id) {
        const result = limitInteractor.get(id as Uuid)

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
