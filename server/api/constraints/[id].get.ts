import ConstraintInteractor from "~/server/application/ConstraintInteractor"
import ConstraintRepository from "~/server/data/repositories/ConstraintRepository"
import { type Uuid } from "~/server/domain/Uuid"

/**
 * Returns a constraint by id
 */
export default defineEventHandler(async (event) => {
    const id = event.context.params?.id,
        constraintInteractor = new ConstraintInteractor(new ConstraintRepository())

    if (id) {
        const result = constraintInteractor.get(id as Uuid)

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
