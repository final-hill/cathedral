import orm from "~/server/data/orm"
import Effect from "~/server/domain/Effect"

/**
 * Returns an effect by id
 */
export default defineEventHandler(async (event) => {
    const id = event.context.params?.id

    if (id) {
        const result = await orm.em.findOne(Effect, id)

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
