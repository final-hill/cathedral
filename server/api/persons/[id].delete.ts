import orm from "~/server/data/orm"
import Person from "~/server/domain/Person"

/**
 * Delete Person by id.
 */
export default defineEventHandler(async (event) => {
    const id = event.context.params?.id

    if (id) {
        orm.em.remove(orm.em.getReference(Person, id))
    } else {
        throw createError({
            statusCode: 400,
            statusMessage: "Bad Request: id is required."
        })
    }
})
