import { fork } from "~/server/data/orm"
import Justification from "~/server/domain/Justification"
import { type Uuid } from "~/server/domain/Uuid"

/**
 * Delete a justification by id.
 */
export default defineEventHandler(async (event) => {
    const id = event.context.params?.id,
        em = fork()

    if (id) {
        em.remove(em.getReference(Justification, id as Uuid))
        await em.flush()
    } else {
        throw createError({
            statusCode: 400,
            statusMessage: "Bad Request: id is required."
        })
    }
})
