import OrganizationRepository from "~/server/data/repositories/OrganizationRepository"
import OrganizationInteractor from "~/server/application/OrganizationInteractor"
import { type Uuid } from "~/server/domain/Uuid"

/**
 * Delete an organization by id.
 */
export default defineEventHandler(async (event) => {
    const id = event.context.params?.id,
        organizationInteractor = new OrganizationInteractor(new OrganizationRepository())

    if (id) {
        organizationInteractor.delete(id as Uuid)
    } else {
        throw createError({
            statusCode: 400,
            statusMessage: "Bad Request: id is required."
        })
    }
})
