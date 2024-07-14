import EnvironmentComponentInteractor from "~/server/application/EnvironmentComponentInteractor"
import EnvironmentComponentRepository from "~/server/data/repositories/EnvironmentComponentRepository"
import { type Uuid } from "~/server/domain/Uuid"

/**
 * Delete an environment component by id.
 */
export default defineEventHandler(async (event) => {
    const id = event.context.params?.id,
        environmentComponentInteractor = new EnvironmentComponentInteractor(
            new EnvironmentComponentRepository()
        )

    if (id) {
        environmentComponentInteractor.delete(id as Uuid)
    } else {
        throw createError({
            statusCode: 400,
            statusMessage: "Bad Request: id is required."
        })
    }
})
