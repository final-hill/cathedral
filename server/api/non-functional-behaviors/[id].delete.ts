import orm from "~/server/data/orm"
import NonFunctionalBehavior from "~/server/domain/NonFunctionalBehavior"

/**
 * Delete non-functional behavior by id.
 */
export default defineEventHandler(async (event) => {
    const id = event.context.params?.id

    if (id) {
        orm.em.remove(orm.em.getReference(NonFunctionalBehavior, id))
    } else {
        throw createError({
            statusCode: 400,
            statusMessage: "Bad Request: id is required."
        })
    }
})
