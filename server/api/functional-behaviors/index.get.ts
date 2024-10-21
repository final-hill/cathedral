import { z } from "zod"
import { fork } from "~/server/data/orm.js"
import { FunctionalBehavior, MoscowPriority, ReqType } from "~/server/domain/requirements/index.js"

const querySchema = z.object({
    solutionId: z.string().uuid(),
    name: z.string().optional(),
    description: z.string().optional(),
    priority: z.nativeEnum(MoscowPriority).optional(),
    isSilence: z.boolean().optional().default(false)
})

/**
 * Returns all functional behaviors that match the query parameters
 */
export default defineEventHandler(async (event) => {
    const query = await validateEventQuery(event, querySchema),
        em = fork()

    await assertSolutionReader(event, query.solutionId)

    return await findAllSolutionRequirements<FunctionalBehavior>(ReqType.FUNCTIONAL_BEHAVIOR, em, query)
})