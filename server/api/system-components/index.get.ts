import { z } from "zod"
import { fork } from "~/server/data/orm.js"
import { SystemComponent } from "~/server/domain/index.js"

const querySchema = z.object({
    solutionId: z.string().uuid(),
    name: z.string().optional(),
    statement: z.string().optional(),
    parentComponentId: z.string().uuid().optional(),
    isSilence: z.boolean().optional().default(false)
})

/**
 * Returns all system-components that match the query parameters
 */
export default defineEventHandler(async (event) => {
    const query = await validateEventQuery(event, querySchema),
        em = fork()

    await assertSolutionReader(event, query.solutionId)

    const results = await em.findAll(SystemComponent, {
        where: Object.entries(query)
            .filter(([_, value]) => value !== undefined)
            .reduce((acc, [key, value]) => {
                if (key.endsWith("Id"))
                    return { ...acc, [key.replace("Id", "")]: value };
                return { ...acc, [key]: { $eq: value } };
            }, {}),
        populate: ['modifiedBy', 'solution', 'parentComponent']
    })

    return results
})