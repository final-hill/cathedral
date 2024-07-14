import NonFunctionalBehaviorInteractor from "~/server/application/NonFunctionalBehaviorInteractor"
import NonFunctionalBehaviorRepository from "~/server/data/repositories/NonFunctionalBehaviorRepository"
import { type Uuid } from "~/server/domain/Uuid"

export default defineEventHandler(async (event) => {
    const id = event.context.params?.id,
        nonFunctionalBehaviorInteractor = new NonFunctionalBehaviorInteractor(new NonFunctionalBehaviorRepository())

    if (id) {
        nonFunctionalBehaviorInteractor.delete(id as Uuid)
    } else {
        throw createError({
            statusCode: 400,
            statusMessage: "Bad Request: id is required."
        })
    }
})
