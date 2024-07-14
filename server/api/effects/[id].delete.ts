import EffectInteractor from "~/server/application/EffectInteractor"
import EffectRepository from "~/server/data/repositories/EffectRepository"
import { type Uuid } from "~/server/domain/Uuid"

/**
 * Delete effect by id.
 */
export default defineEventHandler(async (event) => {
    const id = event.context.params?.id,
        effectInteractor = new EffectInteractor(new EffectRepository())

    if (id) {
        effectInteractor.delete(id as Uuid)
    } else {
        throw createError({
            statusCode: 400,
            statusMessage: "Bad Request: id is required."
        })
    }
})
