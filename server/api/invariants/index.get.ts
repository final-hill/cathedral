import { z } from "zod"
import InvariantInteractor from "~/server/application/InvariantInteractor"
import InvariantRepository from "~/server/data/repositories/InvariantRepository"

const querySchema = z.object({
    name: z.string().optional(),
    statement: z.string().optional(),
    solutionId: z.string().uuid().optional()
})

/**
 * GET /api/invariants
 *
 * Returns all invariants that match the query parameters
 *
 * GET /api/glossary-terms?name&statement&solutionId
 *
 * Returns all invariants that match the query parameters
 */
export default defineEventHandler(async (event) => {
    const invariantInteractor = new InvariantInteractor(new InvariantRepository()),
        query = await getValidatedQuery(event, (q) => querySchema.safeParse(q))

    if (!query.success)
        throw createError({
            statusCode: 400,
            statusMessage: "Bad Request: Invalid query parameters"
        })

    return invariantInteractor.getAll(
        Object.fromEntries(
            Object.entries(query.data)
                .filter(([_, v]) => v !== undefined)
        )
    )
})
