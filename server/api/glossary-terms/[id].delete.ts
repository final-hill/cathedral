import GlossaryTermInteractor from "~/server/application/GlossaryTermInteractor"
import GlossaryTermRepository from "~/server/data/repositories/GlossaryTermRepository"

import { type Uuid } from "~/server/domain/Uuid"

/**
 * Delete glossary term by id.
 */
export default defineEventHandler(async (event) => {
    const id = event.context.params?.id,
        glossaryTermInteractor = new GlossaryTermInteractor(new GlossaryTermRepository())

    if (id) {
        glossaryTermInteractor.delete(id as Uuid)
    } else {
        throw createError({
            statusCode: 400,
            statusMessage: "Bad Request: id is required."
        })
    }
})
