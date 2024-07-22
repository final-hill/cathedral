import { fork } from "~/server/data/orm"
import EnvironmentComponent from "~/server/domain/EnvironmentComponent"
import { type Uuid } from "~/server/domain/Uuid"

/**
 * Delete an environment component by id.
 */
export default defineEventHandler(async (event) => {
    const id = event.context.params?.id,
        em = fork()

    if (id) {
        em.remove(em.getReference(EnvironmentComponent, id as Uuid))
        await em.flush()
    } else {
        throw createError({
            statusCode: 400,
            statusMessage: "Bad Request: id is required."
        })
    }
})
