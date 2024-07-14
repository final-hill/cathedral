import EffectInteractor from "~/server/application/EffectInteractor"
import EffectRepository from "~/server/data/repositories/EffectRepository"
import { type Uuid } from "~/server/domain/Uuid"

/**
 * Returns an effect by id
 */
export default defineEventHandler(async (event) => {
    const id = event.context.params?.id,
        effectInteractor = new EffectInteractor(new EffectRepository())

    if (id) {
        const result = effectInteractor.get(id as Uuid)

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
