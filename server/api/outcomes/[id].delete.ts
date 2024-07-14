import OutcomeInteractor from "~/server/application/OutcomeInteractor"
import OutcomeRepository from "~/server/data/repositories/OutcomeRepository"
import { type Uuid } from "~/server/domain/Uuid"

/**
 * Delete outcome by id.
 */
export default defineEventHandler(async (event) => {
    const id = event.context.params?.id,
        outcomeInteractor = new OutcomeInteractor(new OutcomeRepository())

    if (id) {
        outcomeInteractor.delete(id as Uuid)
    } else {
        throw createError({
            statusCode: 400,
            statusMessage: "Bad Request: id is required."
        })
    }
})
