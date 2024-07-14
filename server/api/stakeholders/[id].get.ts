import StakeholderInteractor from "~/server/application/StakeholderInteractor"
import StakeholderRepository from "~/server/data/repositories/StakeholderRepository"
import { type Uuid } from "~/server/domain/Uuid"

/**
 * Returns a stakeholder by id
 */
export default defineEventHandler(async (event) => {
    const id = event.context.params?.id,
        stakeholderInteractor = new StakeholderInteractor(new StakeholderRepository())

    if (id) {
        const result = stakeholderInteractor.get(id as Uuid)

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
