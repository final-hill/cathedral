import orm from "~/server/data/orm"
import Outcome from "~/server/domain/Outcome"

/**
 * Delete outcome by id.
 */
export default defineEventHandler(async (event) => {
    const id = event.context.params?.id

    if (id) {
        orm.em.remove(orm.em.getReference(Outcome, id))
    } else {
        throw createError({
            statusCode: 400,
            statusMessage: "Bad Request: id is required."
        })
    }
})
