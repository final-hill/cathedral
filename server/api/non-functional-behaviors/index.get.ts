import { z } from "zod"
import NonFunctionalBehaviorInteractor from "~/server/application/NonFunctionalBehaviorInteractor"
import NonFunctionalBehaviorRepository from "~/server/data/repositories/NonFunctionalBehaviorRepository"

const querySchema = z.object({
    name: z.string().optional(),
    statement: z.string().optional(),
    solutionId: z.string().uuid().optional(),
    priorityId: z.enum(['MUST', 'SHOULD', 'COULD', 'WONT']).optional()
})

/**
 * Returns all non functional behaviors that match the query parameters
 */
export default defineEventHandler(async (event) => {
    const nonFunctionalBehaviorInteractor = new NonFunctionalBehaviorInteractor(new NonFunctionalBehaviorRepository()),
        query = await getValidatedQuery(event, (q) => querySchema.safeParse(q))

    if (!query.success)
        throw createError({
            statusCode: 400,
            statusMessage: "Bad Request: Invalid query parameters"
        })

    return nonFunctionalBehaviorInteractor.getAll(
        Object.fromEntries(
            Object.entries(query.data)
                .filter(([_, v]) => v !== undefined)
        )
    )
})
