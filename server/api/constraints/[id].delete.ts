import { fork } from "~/server/data/orm"
import Constraint from "~/server/domain/Constraint"
import { type Uuid } from "~/server/domain/Uuid"

/**
 * Delete constraint by id.
 */
export default defineEventHandler(async (event) => {
    const id = event.context.params?.id,
        em = fork()

    if (id) {
        em.remove(em.getReference(Constraint, id as Uuid))
        await em.flush()
    } else {
        throw createError({
            statusCode: 400,
            statusMessage: "Bad Request: id is required."
        })
    }
})
