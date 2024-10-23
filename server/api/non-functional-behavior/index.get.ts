import { z } from "zod"
import { fork } from "~/server/data/orm.js"
import { MoscowPriority, NonFunctionalBehavior, ReqType } from "~/domain/requirements/index.js"

const querySchema = z.object({
    solutionId: z.string().uuid(),
    name: z.string().optional(),
    description: z.string().optional(),
    priority: z.nativeEnum(MoscowPriority).optional(),
    isSilence: z.boolean().optional().default(false)
})

/**
 * Returns all non functional behaviors that match the query parameters
 */
export default defineEventHandler(async (event) => {
    const query = await validateEventQuery(event, querySchema),
        em = fork()

    await assertSolutionReader(event, query.solutionId)

    return await findAllSolutionRequirements<NonFunctionalBehavior>(ReqType.NON_FUNCTIONAL_BEHAVIOR, em, query)
})