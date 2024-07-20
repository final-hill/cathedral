import orm from "~/server/data/orm"
import UserStory from "~/server/domain/UserStory"

/**
 * Delete User Story by id.
 */
export default defineEventHandler(async (event) => {
    const id = event.context.params?.id

    if (id) {
        orm.em.remove(orm.em.getReference(UserStory, id))
    } else {
        throw createError({
            statusCode: 400,
            statusMessage: "Bad Request: id is required."
        })
    }
})
