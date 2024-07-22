import { fork } from "~/server/data/orm"
import NonFunctionalBehavior from "~/server/domain/NonFunctionalBehavior"
import { type Uuid } from "~/server/domain/Uuid"

/**
 * Delete non-functional behavior by id.
 */
export default defineEventHandler(async (event) => {
    const id = event.context.params?.id,
        em = fork()

    if (id) {
        em.remove(em.getReference(NonFunctionalBehavior, id as Uuid))
        await em.flush()
    } else {
        throw createError({
            statusCode: 400,
            statusMessage: "Bad Request: id is required."
        })
    }
})
