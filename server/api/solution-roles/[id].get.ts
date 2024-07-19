
import { type Uuid } from "~/server/domain/Uuid"
import OrganizationRoleInteractor from "~/server/application/OrganizationRoleInteractor"
import OrganizationRoleRepository from "~/server/data/repositories/OrganizationRoleRepository"

/**
 * Returns an organization role
 */
export default defineEventHandler(async (event) => {
    const id = event.context.params?.id,
        organizationRoleInteractor = new OrganizationRoleInteractor(new OrganizationRoleRepository())

    if (id) {
        const result = organizationRoleInteractor.get(id as Uuid)

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
