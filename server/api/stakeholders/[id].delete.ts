import orm from "~/server/data/orm"
import Stakeholder from "~/server/domain/Stakeholder"

/**
 * Delete Stakeholder by id.
 */
export default defineEventHandler(async (event) => {
    const id = event.context.params?.id

    if (id) {
        orm.em.remove(orm.em.getReference(Stakeholder, id))
    } else {
        throw createError({
            statusCode: 400,
            statusMessage: "Bad Request: id is required."
        })
    }
})
