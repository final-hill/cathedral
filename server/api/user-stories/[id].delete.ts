import { fork } from "~/server/data/orm"
import UserStory from "~/server/domain/UserStory"
import { type Uuid } from "~/server/domain/Uuid"

/**
 * Delete User Story by id.
 */
export default defineEventHandler(async (event) => {
    const id = event.context.params?.id,
        em = fork()

    if (id) {
        em.remove(em.getReference(UserStory, id as Uuid))
        await em.flush()
    } else {
        throw createError({
            statusCode: 400,
            statusMessage: "Bad Request: id is required."
        })
    }
})
