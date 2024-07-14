import SystemComponentInteractor from "~/server/application/SystemComponentInteractor"
import SystemComponentRepository from "~/server/data/repositories/SystemComponentRepository"
import { type Uuid } from "~/server/domain/Uuid"

/**
 * Delete an system component by id.
 */
export default defineEventHandler(async (event) => {
    const id = event.context.params?.id,
        systemComponentInteractor = new SystemComponentInteractor(
            new SystemComponentRepository()
        )

    if (id) {
        systemComponentInteractor.delete(id as Uuid)
    } else {
        throw createError({
            statusCode: 400,
            statusMessage: "Bad Request: id is required."
        })
    }
})
