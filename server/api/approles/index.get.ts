import { z } from "zod"
import { fork } from "~/server/data/orm"
import AppRole from "~/server/domain/application/AppRole"

const querySchema = z.object({
    name: z.string().optional()
})

/**
 * GET /api/approles
 *
 * Returns all approles
 *
 * GET /api/approles?name
 *
 * Returns all approles that match the query parameters
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

    const results = await em.find(AppRole, Object.entries(query.data)
        .filter(([_, value]) => value !== undefined)
        .reduce((acc, [key, value]) => {
            if (key.endsWith("Id"))
                return { ...acc, [key.replace("Id", "")]: value };
            return { ...acc, [key]: { $eq: value } };
        }, {})
    );

    return results
})
