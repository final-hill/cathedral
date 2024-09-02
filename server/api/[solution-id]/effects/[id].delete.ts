import { fork } from "~/server/data/orm"
import { Effect } from "~/server/domain/requirements/index"

/**
 * Delete an effect by id.
 */
export default defineEventHandler(async (event) => {
    const id = event.context.params?.id,
        em = fork()

    if (id) {
        em.remove(em.getReference(Effect, id))
        await em.flush()
    } else {
        throw createError({
            statusCode: 400,
            statusMessage: "Bad Request: id is required."
        })
    }
})
