import ConstraintInteractor from "~/server/application/ConstraintInteractor"
import ConstraintRepository from "~/server/data/repositories/ConstraintRepository"
import { type Uuid } from "~/server/domain/Uuid"

/**
 * Delete constraint by id.
 */
export default defineEventHandler(async (event) => {
    const id = event.context.params?.id,
        constraintInteractor = new ConstraintInteractor(new ConstraintRepository())

    if (id) {
        constraintInteractor.delete(id as Uuid)
    } else {
        throw createError({
            statusCode: 400,
            statusMessage: "Bad Request: id is required."
        })
    }
})
