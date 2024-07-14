import EnvironmentComponentInteractor from "~/server/application/EnvironmentComponentInteractor"
import EnvironmentComponentRepository from "~/server/data/repositories/EnvironmentComponentRepository"
import { type Uuid } from "~/server/domain/Uuid"

/**
 * Returns an environment component by id
 */
export default defineEventHandler(async (event) => {
    const id = event.context.params?.id,
        environmentComponentInteractor = new EnvironmentComponentInteractor(
            new EnvironmentComponentRepository()
        )

    if (id) {
        const result = environmentComponentInteractor.get(id as Uuid)

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
