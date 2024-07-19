import { z } from "zod"
import Organization from "~/server/domain/application/Organization"
import OrganizationRepository from "~/server/data/repositories/OrganizationRepository"
import OrganizationInteractor from "~/server/application/OrganizationInteractor"

const querySchema = z.object({
    name: z.string().max(Organization.maxNameLength).optional(),
    description: z.string().max(Organization.maxDescriptionLength).optional(),
    slug: z.string().max(Organization.maxNameLength).optional()
})

/**
 * GET /api/organizations
 *
 * Returns all organizations
 *
 * GET /api/organizations?name&description&slug
 *
 * Returns all organizations that match the query parameters
 */
export default defineEventHandler(async (event) => {
    const organizationInteractor = new OrganizationInteractor(new OrganizationRepository()),
        query = await getValidatedQuery(event, (q) => querySchema.safeParse(q))

    if (!query.success)
        throw createError({
            statusCode: 400,
            statusMessage: "Bad Request: Invalid query parameters"
        })

    return organizationInteractor.getAll(
        Object.fromEntries(
            Object.entries(query.data)
                .filter(([_, v]) => v !== undefined)
        )
    )
})
