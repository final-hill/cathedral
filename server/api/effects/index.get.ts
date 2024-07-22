import { z } from "zod"
import { fork } from "~/server/data/orm"
import Effect from "~/server/domain/Effect"
import { type Uuid } from "~/server/domain/Uuid"

const querySchema = z.object({
    name: z.string().optional(),
    statement: z.string().optional(),
    solutionId: z.string().uuid().optional()
})

/**
 * GET /api/effects
 *
 * Returns all effects
 *
 * GET /api/effects?name&statement&solutionId
 *
 * Returns all effects that match the query parameters
 */
export default defineEventHandler(async (event) => {
    const query = await getValidatedQuery(event, (q) => querySchema.safeParse(q)),
        em = fork()

    if (!query.success)
        throw createError({
            statusCode: 400,
            statusMessage: "Bad Request: Invalid query parameters"
        })

    const results = await em.find(Effect, Object.entries(query.data)
        .filter(([_, value]) => value !== undefined)
        .reduce((acc, [key, value]) => {
            if (key.endsWith("Id"))
                return { ...acc, [key.replace("Id", "")]: value as Uuid };
            return { ...acc, [key]: { $eq: value } };
        }, {}))

    return results
})
