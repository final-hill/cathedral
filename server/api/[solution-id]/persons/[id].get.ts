import { fork } from "~/server/data/orm"
import { Person } from "~/server/domain/requirements/index"

/**
 * Returns a person by id
 */
export default defineEventHandler(async (event) => {
    const id = event.context.params?.id,
        em = fork()

    if (id) {
        const result = await em.findOne(Person, id)

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
