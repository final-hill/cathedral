import { fork } from "~/server/data/orm"
import Outcome from "~/server/domain/Outcome"
import { type Uuid } from "~/server/domain/Uuid"

/**
 * Delete outcome by id.
 */
export default defineEventHandler(async (event) => {
    const id = event.context.params?.id,
        em = fork()

    if (id) {
        em.remove(em.getReference(Outcome, id as Uuid))
        await em.flush()
    } else {
        throw createError({
            statusCode: 400,
            statusMessage: "Bad Request: id is required."
        })
    }
})
