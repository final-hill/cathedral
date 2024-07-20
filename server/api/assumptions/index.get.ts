import { z } from "zod"
import orm from "~/server/data/orm"
import Assumption from "~/server/domain/Assumption"

const querySchema = z.object({
    name: z.string().optional(),
    statement: z.string().optional(),
    solutionId: z.string().uuid().optional()
})

/**
 * GET /api/assumptions
 *
 * Returns all assumptions
 *
 * GET /api/assumptions?name&statement&solutionId
 *
 * Returns all assumptions that match the query parameters
 */
export default defineEventHandler(async (event) => {
    const query = await getValidatedQuery(event, (q) => querySchema.safeParse(q))

    if (!query.success)
        throw createError({
            statusCode: 400,
            statusMessage: "Bad Request: Invalid query parameters"
        })

    const results = await orm.em.findAll(Assumption, {
        where: Object.fromEntries(
            Object.entries(query.data)
                .filter(([_, v]) => v !== undefined)
                .map(([k, v]) => [k, { $eq: v }])
        )
    })

    return results
})
