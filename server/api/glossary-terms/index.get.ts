import { z } from "zod"
import { fork } from "~/server/data/orm"
import GlossaryTerm from "~/server/domain/requirements/GlossaryTerm"

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
    const query = await getValidatedQuery(event, (q) => querySchema.safeParse(q)),
        em = fork()

    if (!query.success)
        throw createError({
            statusCode: 400,
            statusMessage: "Bad Request: Invalid query parameters",
            message: JSON.stringify(query.error.errors)
        })

    const results = await em.find(GlossaryTerm, Object.entries(query.data)
        .filter(([_, value]) => value !== undefined)
        .reduce((acc, [key, value]) => {
            if (key.endsWith("Id"))
                return { ...acc, [key.replace("Id", "")]: value };
            return { ...acc, [key]: { $eq: value } };
        }, {})
    );

    return results
})
