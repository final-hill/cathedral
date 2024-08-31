import { fork } from "~/server/data/orm"
import { UseCase } from "~/server/domain/requirements/index"

/**
 * Delete UseCase by id.
 */
export default defineEventHandler(async (event) => {
    const id = event.context.params?.id,
        em = fork()

    if (id) {
        em.remove(em.getReference(UseCase, id))
        await em.flush()
    } else {
        throw createError({
            statusCode: 400,
            statusMessage: "Bad Request: id is required."
        })
    }
})
