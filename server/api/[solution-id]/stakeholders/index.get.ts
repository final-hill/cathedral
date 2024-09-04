import { z } from "zod"
import { fork } from "~/server/data/orm"
import { Stakeholder, StakeholderSegmentation, StakeholderCategory } from "~/server/domain/requirements/index.js"

const paramSchema = z.object({
    solutionId: z.string().uuid()
})

const querySchema = z.object({
    name: z.string().optional(),
    statement: z.string().optional(),
    parentComponentId: z.string().uuid().optional(),
    availability: z.number().min(0).max(100).optional(),
    influence: z.number().min(0).max(100).optional(),
    segmentation: z.nativeEnum(StakeholderSegmentation).optional(),
    category: z.nativeEnum(StakeholderCategory).optional()
})

/**
 * Returns all stakeholders that match the optional query parameters
 */
export default defineEventHandler(async (event) => {
    const { solutionId } = await validateEventParams(event, paramSchema),
        query = await validateEventQuery(event, querySchema),
        em = fork()

    await assertSolutionReader(event, solutionId)

    const results = await em.find(Stakeholder, Object.entries(query)
        .filter(([_, value]) => value !== undefined)
        .reduce((acc, [key, value]) => {
            if (key.endsWith("Id"))
                return { ...acc, [key.replace("Id", "")]: value };
            return { ...acc, [key]: { $eq: value } };
        }, {} as Record<string, any>));

    return results
})