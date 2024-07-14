import PersonInteractor from "~/server/application/PersonInteractor"
import PersonRepository from "~/server/data/repositories/PersonRepository"
import { type Uuid } from "~/server/domain/Uuid"

/**
 * Delete Person by id.
 */
export default defineEventHandler(async (event) => {
    const id = event.context.params?.id,
        personInteractor = new PersonInteractor(new PersonRepository())

    if (id) {
        personInteractor.delete(id as Uuid)
    } else {
        throw createError({
            statusCode: 400,
            statusMessage: "Bad Request: id is required."
        })
    }
})
