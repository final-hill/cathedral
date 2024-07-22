import { fork } from "~/server/data/orm"
import Assumption from "~/server/domain/Assumption"
import { type Uuid } from "~/server/domain/Uuid"

/**
 * Delete an assumption by id.
 */
export default defineEventHandler(async (event) => {
    const id = event.context.params?.id,
        em = fork()

    if (id) {
        em.remove(em.getReference(Assumption, id as Uuid))
        await em.flush()
    } else {
        throw createError({
            statusCode: 400,
            statusMessage: "Bad Request: id is required."
        })
    }
})
