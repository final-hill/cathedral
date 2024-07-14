import UseCaseInteractor from "~/server/application/UseCaseInteractor"
import UseCaseRepository from "~/server/data/repositories/UseCaseRepository"
import { type Uuid } from "~/server/domain/Uuid"

/**
 * Delete UseCase by id.
 */
export default defineEventHandler(async (event) => {
    const id = event.context.params?.id,
        useCaseInteractor = new UseCaseInteractor(new UseCaseRepository())

    if (id) {
        useCaseInteractor.delete(id as Uuid)
    } else {
        throw createError({
            statusCode: 400,
            statusMessage: "Bad Request: id is required."
        })
    }
})
