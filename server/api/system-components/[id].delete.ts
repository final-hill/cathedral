import { fork } from "~/server/data/orm"
import SystemComponent from "~/server/domain/SystemComponent"
import { type Uuid } from "~/server/domain/Uuid"

/**
 * Delete an system component by id.
 */
export default defineEventHandler(async (event) => {
    const id = event.context.params?.id,
        em = fork()

    if (id) {
        em.remove(em.getReference(SystemComponent, id as Uuid))
        await em.flush()
    } else {
        throw createError({
            statusCode: 400,
            statusMessage: "Bad Request: id is required."
        })
    }
})
