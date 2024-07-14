import NonFunctionalBehaviorInteractor from "~/server/application/NonFunctionalBehaviorInteractor"
import NonFunctionalBehaviorRepository from "~/server/data/repositories/NonFunctionalBehaviorRepository"
import { type Uuid } from "~/server/domain/Uuid"

export default defineEventHandler(async (event) => {
    const id = event.context.params?.id,
        nonFunctionalBehaviorInteractor = new NonFunctionalBehaviorInteractor(new NonFunctionalBehaviorRepository())

    if (id) {
        const result = nonFunctionalBehaviorInteractor.get(id as Uuid)

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
