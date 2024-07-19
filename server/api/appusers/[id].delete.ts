import AppUserInteractor from "~/server/application/AppUserInteractor"
import AppUserRepository from "~/server/data/repositories/AppUserRepository"

/**
 * Delete an appuser by id.
 */
export default defineEventHandler(async (event) => {
    const id = event.context.params?.id,
        appUserInteractor = new AppUserInteractor(new AppUserRepository())

    if (id) {
        appUserInteractor.delete(id)
    } else {
        throw createError({
            statusCode: 400,
            statusMessage: "Bad Request: id is required."
        })
    }
})
