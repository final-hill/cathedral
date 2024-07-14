import StakeholderInteractor from "~/server/application/StakeholderInteractor"
import StakeholderRepository from "~/server/data/repositories/StakeholderRepository"
import { type Uuid } from "~/server/domain/Uuid"

/**
 * Delete Stakeholder by id.
 */
export default defineEventHandler(async (event) => {
    const id = event.context.params?.id,
        stakeholderInteractor = new StakeholderInteractor(new StakeholderRepository())

    if (id) {
        stakeholderInteractor.delete(id as Uuid)
    } else {
        throw createError({
            statusCode: 400,
            statusMessage: "Bad Request: id is required."
        })
    }
})
