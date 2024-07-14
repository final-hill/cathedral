import SolutionInteractor from "~/server/application/SolutionInteractor"
import SolutionRepository from "~/server/data/repositories/SolutionRepository"
import { type Uuid } from "~/server/domain/Uuid"

/**
 * Delete a solution by id.
 */
export default defineEventHandler(async (event) => {
    const id = event.context.params?.id,
        solutionInteractor = new SolutionInteractor(new SolutionRepository())

    if (id) {
        solutionInteractor.delete(id as Uuid)
    } else {
        throw createError({
            statusCode: 400,
            statusMessage: "Bad Request: id is required."
        })
    }
})
