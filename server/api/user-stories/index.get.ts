import { z } from "zod"
import orm from "~/server/data/orm"
import MoscowPriority from "~/server/domain/MoscowPriority"
import UserStory from "~/server/domain/UserStory"

const querySchema = z.object({
    name: z.string().optional(),
    statement: z.string().optional(),
    solutionId: z.string().uuid().optional(),
    primaryActorId: z.string().uuid().optional(),
    priority: z.nativeEnum(MoscowPriority).optional(),
    outcomeId: z.string().uuid().optional(),
    functionalBehaviorId: z.string().uuid().optional()
})

/**
 * Returns all user stories that match the query parameters
 */
export default defineEventHandler(async (event) => {
    const query = await getValidatedQuery(event, (q) => querySchema.safeParse(q))

    if (!query.success)
        throw createError({
            statusCode: 400,
            statusMessage: "Bad Request: Invalid query parameters"
        })

    const results = await orm.em.findAll(UserStory, {
        where: Object.fromEntries(
            Object.entries(query.data)
                .filter(([_, v]) => v !== undefined)
                .map(([k, v]) => [k, { $eq: v }])
        )
    })

    return results
})
