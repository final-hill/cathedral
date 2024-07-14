import AssumptionInteractor from "~/server/application/AssumptionInteractor"
import AssumptionRepository from "~/server/data/repositories/AssumptionRepository"
import { type Uuid } from "~/server/domain/Uuid"

/**
 * Delete an assumption by id.
 */
export default defineEventHandler(async (event) => {
    const id = event.context.params?.id,
        assumptionInteractor = new AssumptionInteractor(new AssumptionRepository())

    if (id) {
        assumptionInteractor.delete(id as Uuid)
    } else {
        throw createError({
            statusCode: 400,
            statusMessage: "Bad Request: id is required."
        })
    }
})
