import { fork } from "~/server/data/orm"
import GlossaryTerm from "~/server/domain/GlossaryTerm"
import { type Uuid } from "~/server/domain/Uuid"

/**
 * Returns a glossary term by id
 */
export default defineEventHandler(async (event) => {
    const id = event.context.params?.id,
        em = fork()

    if (id) {
        const result = await em.findOne(GlossaryTerm, id as Uuid)

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
