import PersonInteractor from "~/server/application/PersonInteractor"
import PersonRepository from "~/server/data/repositories/PersonRepository"
import { type Uuid } from "~/server/domain/Uuid"

/**
 * Returns a person by id
 */
export default defineEventHandler(async (event) => {
    const id = event.context.params?.id,
        personInteractor = new PersonInteractor(new PersonRepository())

    if (id) {
        const result = personInteractor.get(id as Uuid)

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
