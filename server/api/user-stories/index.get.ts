import { z } from "zod"
import UserStoryRepository from "~/server/data/repositories/UserStoryRepository"
import UserStoryInteractor from "~/server/application/UserStoryInteractor"

const querySchema = z.object({
    name: z.string().optional(),
    statement: z.string().optional(),
    solutionId: z.string().uuid().optional(),
    primaryActorId: z.string().uuid().optional(),
    priorityId: z.enum(["MUST", "SHOULD", "COULD", "WONT"]).optional(),
    outcomeId: z.string().uuid().optional(),
    functionalBehaviorId: z.string().uuid().optional()
})

/**
 * Returns all user stories that match the query parameters
 */
export default defineEventHandler(async (event) => {
    const userStoryInteractor = new UserStoryInteractor(new UserStoryRepository()),
        query = await getValidatedQuery(event, (q) => querySchema.safeParse(q))

    if (!query.success)
        throw createError({
            statusCode: 400,
            statusMessage: "Bad Request: Invalid query parameters"
        })

    return userStoryInteractor.getAll(
        Object.fromEntries(
            Object.entries(query.data)
                .filter(([_, v]) => v !== undefined)
        )
    )
})
