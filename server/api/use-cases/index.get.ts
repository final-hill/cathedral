import { z } from "zod"
import { fork } from "~/server/data/orm.js"
import { MoscowPriority, ReqType, UseCase } from "~/server/domain/requirements/index.js"
import { NIL as emptyUuid } from "uuid"

const querySchema = z.object({
    solutionId: z.string().uuid(),
    name: z.string().optional(),
    description: z.string().optional(),
    primaryActorId: z.string().uuid().optional(),
    priority: z.nativeEnum(MoscowPriority).optional(),
    scope: z.string().optional(),
    level: z.string().optional(),
    goalInContext: z.string().optional(),
    preconditionId: z.string().uuid().optional(),
    triggerId: z.literal(emptyUuid).optional(),
    mainSuccessScenario: z.string().optional(),
    successGuaranteeId: z.string().uuid().optional(),
    extensions: z.string().optional(),
    isSilence: z.boolean().optional().default(false)
})

/**
 * Returns all stakeholders that match the query parameters
 */
export default defineEventHandler(async (event) => {
    const query = await validateEventQuery(event, querySchema),
        em = fork()

    await assertSolutionReader(event, query.solutionId)

    return await findAllSolutionRequirements<UseCase>(ReqType.USE_CASE, em, query)
})