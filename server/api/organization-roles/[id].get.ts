import SolutionRoleInteractor from "~/server/application/SolutionRoleInteractor"
import SolutionRoleRepository from "~/server/data/repositories/SolutionRoleRepository"
import { type Uuid } from "~/server/domain/Uuid"

/**
 * Returns a solution role
 */
export default defineEventHandler(async (event) => {
    const id = event.context.params?.id,
        solutionRoleInteractor = new SolutionRoleInteractor(new SolutionRoleRepository())

    if (id) {
        const result = solutionRoleInteractor.get(id as Uuid)

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
