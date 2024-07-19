import { z } from "zod"
import SolutionRoleInteractor from "~/server/application/SolutionRoleInteractor"
import SolutionRoleRepository from "~/server/data/repositories/SolutionRoleRepository"

const querySchema = z.object({
    id: z.string().optional(),
    description: z.string().optional()
})

/**
 * GET /api/solution-roles
 *
 * Returns all solution roles
 *
 * GET /api/solution-roles?id&description
 *
 * Returns all solution roles that match the query parameters
 */
export default defineEventHandler(async (event) => {
    const solutionRolesInteractor = new SolutionRoleInteractor(new SolutionRoleRepository()),
        query = await getValidatedQuery(event, (q) => querySchema.safeParse(q))

    if (!query.success)
        throw createError({
            statusCode: 400,
            statusMessage: "Bad Request: Invalid query parameters"
        })

    return solutionRolesInteractor.getAll(
        Object.fromEntries(
            Object.entries(query.data)
                .filter(([_, v]) => v !== undefined)
        )
    )
})
