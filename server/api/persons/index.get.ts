import { z } from "zod"
import { fork } from "~/server/data/orm.js"
import { Person } from "~/server/domain/index.js"

const querySchema = z.object({
    solutionId: z.string().uuid(),
    name: z.string().optional(),
    statement: z.string().optional(),
    email: z.string().email().optional(),
    isSilence: z.boolean().optional().default(false)
})

/**
 * Returns all persons that match the query parameters
 */
export default defineEventHandler(async (event) => {
    const query = await validateEventQuery(event, querySchema),
        em = fork()

    await assertSolutionReader(event, query.solutionId)

    const results = await em.findAll(Person, {
        where: Object.entries(query)
            .filter(([_, value]) => value !== undefined)
            .reduce((acc, [key, value]) => {
                if (key.endsWith("Id"))
                    return { ...acc, [key.replace("Id", "")]: value };
                return { ...acc, [key]: { $eq: value } };
            }, {}),
        populate: ['solution', 'modifiedBy']
    });

    return results
})