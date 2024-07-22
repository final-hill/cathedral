import { z } from "zod"
import { fork } from "~/server/data/orm"
import FunctionalBehavior from "~/server/domain/FunctionalBehavior"
import MoscowPriority from "~/server/domain/MoscowPriority"
import { type Uuid } from "~/server/domain/Uuid"

const querySchema = z.object({
    name: z.string().optional(),
    statement: z.string().optional(),
    solutionId: z.string().uuid().optional(),
    priority: z.nativeEnum(MoscowPriority).optional()
})

/**
 * Returns all functional behaviors that match the query parameters
 */
export default defineEventHandler(async (event) => {
    const query = await getValidatedQuery(event, (q) => querySchema.safeParse(q)),
        em = fork()

    if (!query.success)
        throw createError({
            statusCode: 400,
            statusMessage: "Bad Request: Invalid query parameters"
        })

    const results = await em.find(FunctionalBehavior, Object.entries(query.data)
        .filter(([_, value]) => value !== undefined)
        .reduce((acc, [key, value]) => {
            if (key.endsWith("Id"))
                return { ...acc, [key.replace("Id", "")]: value as Uuid };
            return { ...acc, [key]: { $eq: value } };
        }, {}))

    return results
})
