import { z } from "zod"
import { fork } from "~/server/data/orm.js"
import { Stakeholder, StakeholderSegmentation, StakeholderCategory, ReqType } from "~/server/domain/requirements/index.js"

const querySchema = z.object({
    solutionId: z.string().uuid(),
    name: z.string().optional(),
    description: z.string().optional(),
    parentComponentId: z.string().uuid().optional(),
    availability: z.number().min(0).max(100).optional(),
    influence: z.number().min(0).max(100).optional(),
    segmentation: z.nativeEnum(StakeholderSegmentation).optional(),
    category: z.nativeEnum(StakeholderCategory).optional(),
    isSilence: z.boolean().optional().default(false)
})

/**
 * Returns all stakeholders that match the query parameters
 */
export default defineEventHandler(async (event) => {
    const query = await validateEventQuery(event, querySchema),
        em = fork()

    await assertSolutionReader(event, query.solutionId)

    return await findAllSolutionRequirements<Stakeholder>(ReqType.STAKEHOLDER, em, query)
})