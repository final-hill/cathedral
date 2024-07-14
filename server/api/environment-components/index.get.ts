import { z } from "zod"
import EnvironmentComponentInteractor from "~/server/application/EnvironmentComponentInteractor"
import EnvironmentComponentRepository from "~/server/data/repositories/EnvironmentComponentRepository"

const querySchema = z.object({
    name: z.string().optional(),
    statement: z.string().optional(),
    solutionId: z.string().uuid().optional()
})

/**
 * GET /api/environment-components
 *
 * Returns all environment components
 *
 * GET /api/environment-components?name&statement&solutionId&parentComponentId
 *
 * Returns all environment-components that match the query parameters
 */
export default defineEventHandler(async (event) => {
    const environmentComponentInteractor = new EnvironmentComponentInteractor(
        new EnvironmentComponentRepository()
    ),
        query = await getValidatedQuery(event, (q) => querySchema.safeParse(q))

    if (!query.success)
        throw createError({
            statusCode: 400,
            statusMessage: "Bad Request: Invalid query parameters"
        })

    return environmentComponentInteractor.getAll(
        Object.fromEntries(
            Object.entries(query.data)
                .filter(([_, v]) => v !== undefined)
        )
    )
})
