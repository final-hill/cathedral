import { fork } from "~/server/data/orm"
import NonFunctionalBehavior from "~/server/domain/NonFunctionalBehavior"
import { type Uuid } from "~/server/domain/Uuid"

/**
 * Returns a non-functional behavior by id
 */
export default defineEventHandler(async (event) => {
    const id = event.context.params?.id,
        em = fork()

    if (id) {
        const result = await em.findOne(NonFunctionalBehavior, id as Uuid)

        if (result)
            return result
        else
            throw createError({
                statusCode: 404,
                statusMessage: `Item not found with the given id: ${id}`
            })
    } else {
        throw createError({
            statusCode: 400,
            statusMessage: "Bad Request: id is required."
        })
    }
})
