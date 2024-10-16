import { z } from "zod"
import { fork } from "~/server/data/orm.js"
import { UserStory, MoscowPriority } from "~/server/domain/index.js"

const querySchema = z.object({
    solutionId: z.string().uuid(),
    name: z.string().optional(),
    statement: z.string().optional(),
    primaryActorId: z.string().uuid().optional(),
    priority: z.nativeEnum(MoscowPriority).optional(),
    outcomeId: z.string().uuid().optional(),
    functionalBehaviorId: z.string().uuid().optional(),
    isSilence: z.boolean().optional().default(false)
})

/**
 * Returns all user stories that match the query parameters
 */
export default defineEventHandler(async (event) => {
    const query = await validateEventQuery(event, querySchema),
        em = fork()

    await assertSolutionReader(event, query.solutionId)

    const results = await em.findAll(UserStory, {
        where: Object.entries(query)
            .filter(([_, value]) => value !== undefined)
            .reduce((acc, [key, value]) => {
                if (key.endsWith("Id"))
                    return { ...acc, [key.replace("Id", "")]: value };
                return { ...acc, [key]: { $eq: value } };
            }, {}),
        populate: ["primaryActor", "functionalBehavior", "outcome", "modifiedBy", "solution"]
    })

    return results
})