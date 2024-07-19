import AppUserInteractor from "~/server/application/AppUserInteractor"
import AppUserRepository from "~/server/data/repositories/AppUserRepository"
import { type Uuid } from "~/server/domain/Uuid"

/**
 * Returns an appuser by id
 */
export default defineEventHandler(async (event) => {
    const id = event.context.params?.id,
        appUserInteractor = new AppUserInteractor(new AppUserRepository())

    if (id) {
        const result = appUserInteractor.get(id as Uuid)

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
