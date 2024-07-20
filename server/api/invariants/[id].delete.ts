import orm from "~/server/data/orm"
import Invariant from "~/server/domain/Invariant"

/**
 * Delete invariant by id.
 */
export default defineEventHandler(async (event) => {
    const id = event.context.params?.id

    if (id) {
        orm.em.remove(orm.em.getReference(Invariant, id))
    } else {
        throw createError({
            statusCode: 400,
            statusMessage: "Bad Request: id is required."
        })
    }
})
