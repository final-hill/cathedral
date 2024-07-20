import orm from "~/server/data/orm"
import SystemComponent from "~/server/domain/SystemComponent"

/**
 * Delete an system component by id.
 */
export default defineEventHandler(async (event) => {
    const id = event.context.params?.id

    if (id) {
        orm.em.remove(orm.em.getReference(SystemComponent, id))
    } else {
        throw createError({
            statusCode: 400,
            statusMessage: "Bad Request: id is required."
        })
    }
})
