import { z } from "zod"
import { Assumption } from "~/server/domain/requirements/index.js"
import { fork } from "~/server/data/orm"

const paramSchema = z.object({
    solutionId: z.string().uuid()
})

const querySchema = z.object({
    name: z.string().optional(),
    statement: z.string().optional()
})

/**
 * Returns all assumptions that match the optional query parameters
 */
export default defineEventHandler(async (event) => {
    const { solutionId } = await validateEventParams(event, paramSchema),
        query = await validateEventQuery(event, querySchema),
        em = fork()

    await assertSolutionReader(event, solutionId)

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