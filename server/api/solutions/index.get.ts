import SolutionInteractor from "~/server/application/SolutionInteractor"
import SolutionRepository from "~/server/data/repositories/SolutionRepository"
import { z } from "zod"
import Solution from "~/server/domain/Solution"

const querySchema = z.object({
    name: z.string().max(Solution.maxNameLength).optional(),
    description: z.string().max(Solution.maxDescriptionLength).optional(),
    slug: z.string().max(Solution.maxNameLength).optional()
})

/**
 * GET /api/solutions
 *
 * Returns all solutions
 *
 * GET /api/solutions?name&description&slug
 *
 * Returns all solutions that match the query parameters
 */
export default defineEventHandler(async (event) => {
    const solutionInteractor = new SolutionInteractor(new SolutionRepository()),
        query = await getValidatedQuery(event, (q) => querySchema.safeParse(q))

    if (!query.success)
        throw createError({
            statusCode: 400,
            statusMessage: "Bad Request: Invalid query parameters"
        })

    return solutionInteractor.getAll(
        Object.fromEntries(
            Object.entries(query.data)
                .filter(([_, v]) => v !== undefined)
        )
    )
})
