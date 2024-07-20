import orm from "~/server/data/orm"
import Effect from "~/server/domain/Effect"

/**
 * Delete an effect by id.
 */
export default defineEventHandler(async (event) => {
    const id = event.context.params?.id

    if (id) {
        orm.em.remove(orm.em.getReference(Effect, id))
    } else {
        throw createError({
            statusCode: 400,
            statusMessage: "Bad Request: id is required."
        })
    }
})
