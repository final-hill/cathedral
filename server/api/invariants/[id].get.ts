import InvariantInteractor from "~/server/application/InvariantInteractor"
import InvariantRepository from "~/server/data/repositories/InvariantRepository"
import { type Uuid } from "~/server/domain/Uuid"

/**
 * Returns an invariant by id
 */
export default defineEventHandler(async (event) => {
    const id = event.context.params?.id,
        invariantInteractor = new InvariantInteractor(new InvariantRepository())

    if (id) {
        const result = invariantInteractor.get(id as Uuid)

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
