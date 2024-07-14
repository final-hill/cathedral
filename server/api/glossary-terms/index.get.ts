import { z } from "zod"
import GlossaryTermRepository from "~/server/data/repositories/GlossaryTermRepository"
import GlossaryTermInteractor from "~/server/application/GlossaryTermInteractor"

const querySchema = z.object({
    name: z.string().optional(),
    statement: z.string().optional(),
    solutionId: z.string().uuid().optional()
})

/**
 * GET /api/glossary-terms
 *
 * Returns all glossary terms that match the query parameters
 *
 * GET /api/glossary-terms?name&statement&solutionId
 *
 * Returns all glossay terms that match the query parameters
 */
export default defineEventHandler(async (event) => {
    const glossaryTermInteractor = new GlossaryTermInteractor(new GlossaryTermRepository()),
        query = await getValidatedQuery(event, (q) => querySchema.safeParse(q))

    if (!query.success)
        throw createError({
            statusCode: 400,
            statusMessage: "Bad Request: Invalid query parameters"
        })

    return glossaryTermInteractor.getAll(
        Object.fromEntries(
            Object.entries(query.data)
                .filter(([_, v]) => v !== undefined)
        )
    )
})
