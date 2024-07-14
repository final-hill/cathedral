import { z } from "zod"
import ConstraintRepository from "~/server/data/repositories/ConstraintRepository"
import ConstraintInteractor from "~/server/application/ConstraintInteractor"

const querySchema = z.object({
    name: z.string().optional(),
    statement: z.string().optional(),
    solutionId: z.string().uuid().optional(),
    categoryId: z.enum(['BUSINESS', 'ENGINEERING', 'PHYSICS']).optional()
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
    const constraintInteractor = new ConstraintInteractor(new ConstraintRepository()),
        query = await getValidatedQuery(event, (q) => querySchema.safeParse(q))

    if (!query.success)
        throw createError({
            statusCode: 400,
            statusMessage: "Bad Request: Invalid query parameters"
        })

    return constraintInteractor.getAll(
        Object.fromEntries(
            Object.entries(query.data)
                .filter(([_, v]) => v !== undefined)
        )
    )
})
