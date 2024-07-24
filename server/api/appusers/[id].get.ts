import { fork } from "~/server/data/orm"
import AppUser from "~/server/domain/application/AppUser"

/**
 * Returns an appuser by id
 */
export default defineEventHandler(async (event) => {
    // To get a specific appuser, you just need to be logged in (middleware)
    // and provide the id of the appuser

    const id = event.context.params?.id,
        em = fork()

    if (id) {
        const result = await em.findOne(AppUser, id)

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
