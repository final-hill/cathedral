import { type Uuid } from "~/server/domain/Uuid"
import FunctionalBehaviorInteractor from "~/server/application/FunctionalBehaviorInteractor"
import FunctionalBehaviorRepository from "~/server/data/repositories/FunctionalBehaviorRepository"

export default defineEventHandler(async (event) => {
    const id = event.context.params?.id,
        functionalBehaviorInteractor = new FunctionalBehaviorInteractor(new FunctionalBehaviorRepository())

    if (id) {
        functionalBehaviorInteractor.delete(id as Uuid)
    } else {
        throw createError({
            statusCode: 400,
            statusMessage: "Bad Request: id is required."
        })
    }
})
