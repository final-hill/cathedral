import SolutionRoleInteractor from "~/server/application/SolutionRoleInteractor"
import SolutionRoleRepository from "~/server/data/repositories/SolutionRoleRepository"
import { type Uuid } from "~/server/domain/Uuid"

/**
 * Delete a solution role
 */
export default defineEventHandler(async (event) => {
    const id = event.context.params?.id,
        solutionRoleInteractor = new SolutionRoleInteractor(new SolutionRoleRepository())

    if (id) {
        solutionRoleInteractor.delete(id as Uuid)
    } else {
        throw createError({
            statusCode: 400,
            statusMessage: "Bad Request: id is required."
        })
    }
})
