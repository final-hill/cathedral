import { z } from "zod"
import OutcomeRepository from "~/server/data/repositories/OutcomeRepository"
import OutcomeInteractor from "~/server/application/OutcomeInteractor"

const querySchema = z.object({
    name: z.string().optional(),
    statement: z.string().optional(),
    solutionId: z.string().uuid().optional()
})

/**
 * GET /api/obstacles?name&statement&solutionId
 *
 * Returns all obstacles that match the query parameters
 */
export default defineEventHandler(async (event) => {
    const outcomeInteractor = new OutcomeInteractor(new OutcomeRepository()),
        query = await getValidatedQuery(event, (q) => querySchema.safeParse(q))

    if (!query.success)
        throw createError({
            statusCode: 400,
            statusMessage: "Bad Request: Invalid query parameters"
        })

    return outcomeInteractor.getAll(
        Object.fromEntries(
            Object.entries(query.data)
                .filter(([_, v]) => v !== undefined)
        )
    )
})
