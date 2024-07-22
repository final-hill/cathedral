import { fork } from "~/server/data/orm"
import { z } from "zod"
import Solution from "~/server/domain/Solution"

const querySchema = z.object({
    name: z.string().max(100).optional(),
    description: z.string().optional(),
    slug: z.string().max(100).optional()
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
    const query = await getValidatedQuery(event, (q) => querySchema.safeParse(q)),
        em = fork()

    if (!query.success)
        throw createError({
            statusCode: 400,
            statusMessage: "Bad Request: Invalid query parameters"
        })

    const results = await em.find(Solution, Object.entries(query.data)
        .filter(([_, value]) => value !== undefined)
        .reduce((acc, [key, value]) => {
            Object.assign(acc, { [key]: { $eq: value } })
            return acc;
        }, {}))

    return results
})
