import { fork } from "~/server/data/orm"
import EnvironmentComponent from "~/server/domain/requirements/EnvironmentComponent"

/**
 * Delete an environment component by id.
 */
export default defineEventHandler(async (event) => {
    const id = event.context.params?.id,
        em = fork()

    if (id) {
        em.remove(em.getReference(EnvironmentComponent, id))
        await em.flush()
    } else {
        throw createError({
            statusCode: 400,
            statusMessage: "Bad Request: id is required."
        })
    }
})
