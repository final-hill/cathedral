import { fork } from "~/server/data/orm"
import Limit from "~/server/domain/Limit"
import { type Uuid } from "~/server/domain/Uuid"

/**
 * Delete limit by id.
 */
export default defineEventHandler(async (event) => {
    const id = event.context.params?.id,
        em = fork()

    if (id) {
        em.remove(em.getReference(Limit, id as Uuid))
        await em.flush()
    } else {
        throw createError({
            statusCode: 400,
            statusMessage: "Bad Request: id is required."
        })
    }
})
