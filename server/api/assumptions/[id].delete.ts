import orm from "~/server/data/orm"
import Assumption from "~/server/domain/Assumption"

/**
 * Delete an assumption by id.
 */
export default defineEventHandler(async (event) => {
    const id = event.context.params?.id

    if (id) {
        orm.em.remove(orm.em.getReference(Assumption, id))
    } else {
        throw createError({
            statusCode: 400,
            statusMessage: "Bad Request: id is required."
        })
    }
})
