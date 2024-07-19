import { z } from "zod"
import OrganizationRoleInteractor from "~/server/application/OrganizationRoleInteractor"
import OrganizationRoleRepository from "~/server/data/repositories/OrganizationRoleRepository"

const querySchema = z.object({
    id: z.string().optional(),
    description: z.string().optional()
})

/**
 * GET /api/organization-roles
 *
 * Returns all organization roles
 *
 * GET /api/organization-roles?id&description
 *
 * Returns all organization roles that match the query parameters
 */
export default defineEventHandler(async (event) => {
    const organizationRolesInteractor = new OrganizationRoleInteractor(new OrganizationRoleRepository()),
        query = await getValidatedQuery(event, (q) => querySchema.safeParse(q))

    if (!query.success)
        throw createError({
            statusCode: 400,
            statusMessage: "Bad Request: Invalid query parameters"
        })

    return organizationRolesInteractor.getAll(
        Object.fromEntries(
            Object.entries(query.data)
                .filter(([_, v]) => v !== undefined)
        )
    )
})
