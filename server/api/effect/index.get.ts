import { z } from "zod"
import { fork } from "~/server/data/orm.js"
import { Effect, ReqType } from "~/domain/requirements/index.js"

const querySchema = z.object({
    solutionId: z.string().uuid(),
    name: z.string().optional(),
    description: z.string().optional(),
    isSilence: z.boolean().optional().default(false)
})

/**
 * Returns all effects that match the query parameters
 */
export default defineEventHandler(async (event) => {
    const query = await validateEventQuery(event, querySchema),
        em = fork()

    await assertSolutionReader(event, query.solutionId)

    return await findAllSolutionRequirements<Effect>(ReqType.EFFECT, em, query)
})


