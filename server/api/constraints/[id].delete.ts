import orm from "~/server/data/orm"
import Constraint from "~/server/domain/Constraint"

/**
 * Delete constraint by id.
 */
export default defineEventHandler(async (event) => {
    const id = event.context.params?.id

    if (id) {
        orm.em.remove(orm.em.getReference(Constraint, id))
    } else {
        throw createError({
            statusCode: 400,
            statusMessage: "Bad Request: id is required."
        })
    }
})
