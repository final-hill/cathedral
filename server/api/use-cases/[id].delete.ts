import orm from "~/server/data/orm"
import UseCase from "~/server/domain/UseCase"

/**
 * Delete UseCase by id.
 */
export default defineEventHandler(async (event) => {
    const id = event.context.params?.id

    if (id) {
        orm.em.remove(orm.em.getReference(UseCase, id))
    } else {
        throw createError({
            statusCode: 400,
            statusMessage: "Bad Request: id is required."
        })
    }
})
