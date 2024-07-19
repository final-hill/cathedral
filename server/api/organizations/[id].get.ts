import OrganizationRepository from "~/server/data/repositories/OrganizationRepository"
import OrganizationInteractor from "~/server/application/OrganizationInteractor"
import { type Uuid } from "~/server/domain/Uuid"

/**
 * Returns an organization by id
 */
export default defineEventHandler(async (event) => {
    const id = event.context.params?.id,
        organizationInteractor = new OrganizationInteractor(new OrganizationRepository())

    if (id) {
        const result = organizationInteractor.get(id as Uuid)

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
