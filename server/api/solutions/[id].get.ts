import { type Uuid } from "~/server/domain/Uuid"
import SolutionInteractor from "~/server/application/SolutionInteractor"
import SolutionRepository from "~/server/data/repositories/SolutionRepository"

/**
 * Returns a solution by id
 */
export default defineEventHandler(async (event) => {
    const id = event.context.params?.id,
        solutionInteractor = new SolutionInteractor(new SolutionRepository())

    if (id) {
        const result = solutionInteractor.get(id as Uuid)

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
