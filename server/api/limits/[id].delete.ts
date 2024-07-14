import LimitInteractor from "~/server/application/LimitInteractor"
import LimitRepository from "~/server/data/repositories/LimitRepository"
import { type Uuid } from "~/server/domain/Uuid"

/**
 * Delete limit by id.
 */
export default defineEventHandler(async (event) => {
    const id = event.context.params?.id,
        limitInteractor = new LimitInteractor(new LimitRepository())

    if (id) {
        limitInteractor.delete(id as Uuid)
    } else {
        throw createError({
            statusCode: 400,
            statusMessage: "Bad Request: id is required."
        })
    }
})
