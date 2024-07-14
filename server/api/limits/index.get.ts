import { z } from "zod"
import LimitInteractor from "~/server/application/LimitInteractor"
import LimitRepository from "~/server/data/repositories/LimitRepository"

const querySchema = z.object({
    name: z.string().optional(),
    statement: z.string().optional(),
    solutionId: z.string().uuid().optional()
})

/**
 * GET /api/effects?name&statement&solutionId
 *
 * Returns all limits that match the query parameters
 */
export default defineEventHandler(async (event) => {
    const limitInteractor = new LimitInteractor(new LimitRepository()),
        query = await getValidatedQuery(event, (q) => querySchema.safeParse(q))

    if (!query.success)
        throw createError({
            statusCode: 400,
            statusMessage: "Bad Request: Invalid query parameters"
        })

    return limitInteractor.getAll(
        Object.fromEntries(
            Object.entries(query.data)
                .filter(([_, v]) => v !== undefined)
        )
    )
})
