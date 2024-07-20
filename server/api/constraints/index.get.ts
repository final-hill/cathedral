import { z } from "zod"
import orm from "~/server/data/orm"
import Constraint, { ConstraintCategory } from "~/server/domain/Constraint"

const querySchema = z.object({
    name: z.string().optional(),
    statement: z.string().optional(),
    solutionId: z.string().uuid().optional(),
    category: z.nativeEnum(ConstraintCategory).optional()
})

/**
 * GET /api/constraints
 *
 * Returns all constraints
 *
 * GET /api/constraints?name&statement&solutionId&categoryId
 *
 * Returns all constraints that match the query parameters
 */
export default defineEventHandler(async (event) => {
    const query = await getValidatedQuery(event, (q) => querySchema.safeParse(q))

    if (!query.success)
        throw createError({
            statusCode: 400,
            statusMessage: "Bad Request: Invalid query parameters"
        })

    const results = await orm.em.findAll(Constraint, {
        where: Object.fromEntries(
            Object.entries(query.data)
                .filter(([_, v]) => v !== undefined)
                .map(([k, v]) => [k, { $eq: v }])
        )
    })

    return results
})
