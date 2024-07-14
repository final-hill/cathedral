import { z } from "zod"
import EffectInteractor from "~/server/application/EffectInteractor"
import EffectRepository from "~/server/data/repositories/EffectRepository"

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
    const effectInteractor = new EffectInteractor(new EffectRepository()),
        query = await getValidatedQuery(event, (q) => querySchema.safeParse(q))

    if (!query.success)
        throw createError({
            statusCode: 400,
            statusMessage: "Bad Request: Invalid query parameters"
        })

    return effectInteractor.getAll(
        Object.fromEntries(
            Object.entries(query.data)
                .filter(([_, v]) => v !== undefined)
        )
    )
})
