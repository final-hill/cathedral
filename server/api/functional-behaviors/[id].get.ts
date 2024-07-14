import FunctionalBehaviorInteractor from "~/server/application/FunctionalBehaviorInteractor"
import FunctionalBehaviorRepository from "~/server/data/repositories/FunctionalBehaviorRepository"
import { type Uuid } from "~/server/domain/Uuid"

export default defineEventHandler(async (event) => {
    const id = event.context.params?.id,
        functionalBehaviorInteractor = new FunctionalBehaviorInteractor(new FunctionalBehaviorRepository())

    if (id) {
        const result = functionalBehaviorInteractor.get(id as Uuid)

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
