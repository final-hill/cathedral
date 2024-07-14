import UseCaseInteractor from "~/server/application/UseCaseInteractor"
import UseCaseRepository from "~/server/data/repositories/UseCaseRepository"
import { type Uuid } from "~/server/domain/Uuid"

/**
 * Returns a UseCase by id
 */
export default defineEventHandler(async (event) => {
    const id = event.context.params?.id,
        useCaseInteractor = new UseCaseInteractor(new UseCaseRepository())

    if (id) {
        const result = useCaseInteractor.get(id as Uuid)

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
