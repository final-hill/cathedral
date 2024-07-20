import orm from "~/server/data/orm"
import Obstacle from "~/server/domain/Obstacle"

/**
 * Delete obstacle by id.
 */
export default defineEventHandler(async (event) => {
    const id = event.context.params?.id

    if (id) {
        orm.em.remove(orm.em.getReference(Obstacle, id))
    } else {
        throw createError({
            statusCode: 400,
            statusMessage: "Bad Request: id is required."
        })
    }
})
