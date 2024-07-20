import orm from "~/server/data/orm"
import EnvironmentComponent from "~/server/domain/EnvironmentComponent"

/**
 * Delete an environment component by id.
 */
export default defineEventHandler(async (event) => {
    const id = event.context.params?.id

    if (id) {
        orm.em.remove(orm.em.getReference(EnvironmentComponent, id))
    } else {
        throw createError({
            statusCode: 400,
            statusMessage: "Bad Request: id is required."
        })
    }
})
