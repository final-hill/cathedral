import { z } from "zod"
import FunctionalBehaviorInteractor from "~/server/application/FunctionalBehaviorInteractor"
import FunctionalBehaviorRepository from "~/server/data/repositories/FunctionalBehaviorRepository"

const querySchema = z.object({
    name: z.string().optional(),
    statement: z.string().optional(),
    solutionId: z.string().uuid().optional(),
    priorityId: z.enum(['MUST', 'SHOULD', 'COULD', 'WONT']).optional()
})

/**
 * Returns all functional behaviors that match the query parameters
 */
export default defineEventHandler(async (event) => {
    const functionalBehaviorInteractor = new FunctionalBehaviorInteractor(new FunctionalBehaviorRepository()),
        query = await getValidatedQuery(event, (q) => querySchema.safeParse(q))

    if (!query.success)
        throw createError({
            statusCode: 400,
            statusMessage: "Bad Request: Invalid query parameters"
        })

    return functionalBehaviorInteractor.getAll(
        Object.fromEntries(
            Object.entries(query.data)
                .filter(([_, v]) => v !== undefined)
        )
    )
})
