import { z } from "zod"
import SystemComponentInteractor from "~/server/application/SystemComponentInteractor"
import SystemComponentRepository from "~/server/data/repositories/SystemComponentRepository"

const querySchema = z.object({
    name: z.string().optional(),
    statement: z.string().optional(),
    solutionId: z.string().uuid().optional(),
    parentComponentId: z.string().uuid().optional()
})

/**
 * GET /api/system-components?name&statement&solutionId&parentComponentId
 *
 * Returns all system-components that match the query parameters
 */
export default defineEventHandler(async (event) => {
    const systemComponentInteractor = new SystemComponentInteractor(
        new SystemComponentRepository()
    ),
        query = await getValidatedQuery(event, (q) => querySchema.safeParse(q))

    if (!query.success)
        throw createError({
            statusCode: 400,
            statusMessage: "Bad Request: Invalid query parameters"
        })

    return systemComponentInteractor.getAll(
        Object.fromEntries(
            Object.entries(query.data)
                .filter(([_, v]) => v !== undefined)
        )
    )
})
