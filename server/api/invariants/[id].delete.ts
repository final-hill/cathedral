import InvariantInteractor from "~/server/application/InvariantInteractor"
import InvariantRepository from "~/server/data/repositories/InvariantRepository"
import { type Uuid } from "~/server/domain/Uuid"

/**
 * Delete invariant by id.
 */
export default defineEventHandler(async (event) => {
    const id = event.context.params?.id,
        invariantInteractor = new InvariantInteractor(new InvariantRepository())

    if (id) {
        invariantInteractor.delete(id as Uuid)
    } else {
        throw createError({
            statusCode: 400,
            statusMessage: "Bad Request: id is required."
        })
    }
})
