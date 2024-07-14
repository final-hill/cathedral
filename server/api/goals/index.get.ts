import { z } from "zod"
import GoalInteractor from "~/server/application/GoalInteractor"
import GoalRepository from "~/server/data/repositories/GoalRepository"

const querySchema = z.object({
    name: z.string().optional(),
    statement: z.string().optional(),
    solutionId: z.string().uuid().optional()
})

/**
 * GET /api/goals
 *
 * Returns all goals
 *
 * GET /api/goals?name&statement&solutionId
 *
 * Returns all goals that match the query parameters
 */
export default defineEventHandler(async (event) => {
    const goalInteractor = new GoalInteractor(new GoalRepository()),
        query = await getValidatedQuery(event, (q) => querySchema.safeParse(q))

    if (!query.success)
        throw createError({
            statusCode: 400,
            statusMessage: "Bad Request: Invalid query parameters"
        })

    return goalInteractor.getAll(
        Object.fromEntries(
            Object.entries(query.data)
                .filter(([_, v]) => v !== undefined)
        )
    )
})
