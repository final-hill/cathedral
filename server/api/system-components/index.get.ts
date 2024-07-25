import { z } from "zod"
import { fork } from "~/server/data/orm"
import SystemComponent from "~/server/domain/requirements/SystemComponent"

const querySchema = z.object({
    name: z.string().optional(),
    statement: z.string().optional(),
    solutionId: z.string().uuid().optional(),
    parentComponentId: z.string().uuid().optional()
})

/**
 * GET /api/system-components?name&statement&solutionId&parentComponentId
 *
 * Returns all system-components that match the query parameters
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

    const results = await em.find(SystemComponent, Object.entries(query.data)
        .filter(([_, value]) => value !== undefined)
        .reduce((acc, [key, value]) => {
            if (key.endsWith("Id"))
                return { ...acc, [key.replace("Id", "")]: value };
            return { ...acc, [key]: { $eq: value } };
        }, {}))

    return results
})
