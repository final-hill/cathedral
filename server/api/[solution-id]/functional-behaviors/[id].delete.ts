import { fork } from "~/server/data/orm"
import { FunctionalBehavior } from "~/server/domain/requirements/index"

/**
 * Delete an functional behavior by id.
 */
export default defineEventHandler(async (event) => {
    const id = event.context.params?.id,
        em = fork()

    if (id) {
        em.remove(em.getReference(FunctionalBehavior, id))
        await em.flush()
    } else {
        throw createError({
            statusCode: 400,
            statusMessage: "Bad Request: id is required."
        })
    }
})
