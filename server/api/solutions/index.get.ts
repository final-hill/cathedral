import orm from "~/server/data/orm"
import { z } from "zod"
import Solution from "~/server/domain/Solution"

const querySchema = z.object({
    name: z.string().max(Solution.maxNameLength).optional(),
    description: z.string().optional(),
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
    const query = await getValidatedQuery(event, (q) => querySchema.safeParse(q))

    if (!query.success)
        throw createError({
            statusCode: 400,
            statusMessage: "Bad Request: Invalid query parameters"
        })

    const results = await orm.em.findAll(Solution, {
        where: Object.fromEntries(
            Object.entries(query.data)
                .filter(([_, v]) => v !== undefined)
                .map(([k, v]) => [k, { $eq: v }])
        )
    })

    return results
})
