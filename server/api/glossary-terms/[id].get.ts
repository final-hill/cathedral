import GlossaryTermInteractor from "~/server/application/GlossaryTermInteractor"
import GlossaryTermRepository from "~/server/data/repositories/GlossaryTermRepository"
import { type Uuid } from "~/server/domain/Uuid"

/**
 * Returns a glossary term by id
 */
export default defineEventHandler(async (event) => {
    const id = event.context.params?.id,
        glossaryTermInteractor = new GlossaryTermInteractor(new GlossaryTermRepository())

    if (id) {
        const result = glossaryTermInteractor.get(id as Uuid)

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
