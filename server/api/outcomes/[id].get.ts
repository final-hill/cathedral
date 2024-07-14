import OutcomeInteractor from "~/server/application/OutcomeInteractor"
import OutcomeRepository from "~/server/data/repositories/OutcomeRepository"
import { type Uuid } from "~/server/domain/Uuid"

/**
 * Returns an outcome by id
 */
export default defineEventHandler(async (event) => {
    const id = event.context.params?.id,
        outcomeInteractor = new OutcomeInteractor(new OutcomeRepository())

    if (id) {
        const result = outcomeInteractor.get(id as Uuid)

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
