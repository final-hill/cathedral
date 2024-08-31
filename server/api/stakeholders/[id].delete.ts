import { fork } from "~/server/data/orm"
import { Stakeholder } from "~/server/domain/requirements/index"

/**
 * Delete Stakeholder by id.
 */
export default defineEventHandler(async (event) => {
    const id = event.context.params?.id,
        em = fork()

    if (id) {
        em.remove(em.getReference(Stakeholder, id))
        await em.flush()
    } else {
        throw createError({
            statusCode: 400,
            statusMessage: "Bad Request: id is required."
        })
    }
})
