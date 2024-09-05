import { z } from "zod"
import { Assumption } from "~/server/domain/requirements/index.js"
import { fork } from "~/server/data/orm"

const querySchema = z.object({
    solutionId: z.string().uuid(),
    name: z.string().optional(),
    statement: z.string().optional()
})

/**
 * Returns all assumptions that match the query parameters
 */
export default defineEventHandler(async (event) => {
    const query = await validateEventQuery(event, querySchema),
        em = fork()

    await assertSolutionReader(event, query.solutionId)

    const results = await em.find(Assumption, Object.entries(query)
        .filter(([_, value]) => value !== undefined)
        .reduce((acc, [key, value]) => {
            if (key.endsWith("Id"))
                return { ...acc, [key.replace("Id", "")]: value };
            return { ...acc, [key]: { $eq: value } };
        }, {})
    );

    return results
})