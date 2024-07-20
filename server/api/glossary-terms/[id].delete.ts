import orm from "~/server/data/orm"
import GlossaryTerm from "~/server/domain/GlossaryTerm"

/**
 * Delete glossary term by id.
 */
export default defineEventHandler(async (event) => {
    const id = event.context.params?.id

    if (id) {
        orm.em.remove(orm.em.getReference(GlossaryTerm, id))
    } else {
        throw createError({
            statusCode: 400,
            statusMessage: "Bad Request: id is required."
        })
    }
})
