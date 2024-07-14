import { z } from "zod"
import AssumptionInteractor from "~/server/application/AssumptionInteractor"
import AssumptionRepository from "~/server/data/repositories/AssumptionRepository"

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
    const assumptionInteractor = new AssumptionInteractor(new AssumptionRepository()),
        query = await getValidatedQuery(event, (q) => querySchema.safeParse(q))

    if (!query.success)
        throw createError({
            statusCode: 400,
            statusMessage: "Bad Request: Invalid query parameters"
        })

    return assumptionInteractor.getAll(
        Object.fromEntries(
            Object.entries(query.data)
                .filter(([_, v]) => v !== undefined)
        )
    )
})
