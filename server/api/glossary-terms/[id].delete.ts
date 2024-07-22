import { fork } from "~/server/data/orm"
import GlossaryTerm from "~/server/domain/GlossaryTerm"
import { type Uuid } from "~/server/domain/Uuid"

/**
 * Delete glossary term by id.
 */
export default defineEventHandler(async (event) => {
    const id = event.context.params?.id,
        em = fork()

    if (id) {
        em.remove(em.getReference(GlossaryTerm, id as Uuid))
        await em.flush()
    } else {
        throw createError({
            statusCode: 400,
            statusMessage: "Bad Request: id is required."
        })
    }
})
