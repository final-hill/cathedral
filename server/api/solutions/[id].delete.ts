import { fork } from "~/server/data/orm"
import Solution from "~/server/domain/Solution"
import { type Uuid } from "~/server/domain/Uuid"

/**
 * Delete a solution by id.
 */
export default defineEventHandler(async (event) => {
    const id = event.context.params?.id,
        em = fork()

    if (id) {
        em.remove(em.getReference(Solution, id as Uuid))
        await em.flush()
    } else {
        throw createError({
            statusCode: 400,
            statusMessage: "Bad Request: id is required."
        })
    }
})
