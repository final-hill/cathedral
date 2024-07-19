import OrganizationRoleInteractor from "~/server/application/OrganizationRoleInteractor"
import OrganizationRoleRepository from "~/server/data/repositories/OrganizationRoleRepository"
import { type Uuid } from "~/server/domain/Uuid"

/**
 * Delete an organization role
 */
export default defineEventHandler(async (event) => {
    const id = event.context.params?.id,
        organizationRoleInteractor = new OrganizationRoleInteractor(new OrganizationRoleRepository())

    if (id) {
        organizationRoleInteractor.delete(id as Uuid)
    } else {
        throw createError({
            statusCode: 400,
            statusMessage: "Bad Request: id is required."
        })
    }
})
