import SystemComponentInteractor from "~/server/application/SystemComponentInteractor"
import SystemComponentRepository from "~/server/data/repositories/SystemComponentRepository"
import { type Uuid } from "~/server/domain/Uuid"

/**
 * Returns an system component by id
 */
export default defineEventHandler(async (event) => {
    const id = event.context.params?.id,
        systemComponentInteractor = new SystemComponentInteractor(
            new SystemComponentRepository()
        )

    if (id) {
        const result = systemComponentInteractor.get(id as Uuid)

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
