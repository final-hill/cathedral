import { z } from "zod"
import { fork } from "~/server/data/orm"
import Stakeholder from "~/server/domain/Stakeholder"
import StakeholderSegmentation from "~/server/domain/StakeholderSegmentation"
import StakeholderCategory from "~/server/domain/StakeholderCategory"
import { type Uuid } from "~/server/domain/Uuid"

const querySchema = z.object({
    name: z.string().optional(),
    statement: z.string().optional(),
    solutionId: z.string().uuid().optional(),
    parentComponentId: z.string().uuid().optional(),
    availability: z.number().min(0).max(100).optional(),
    influence: z.number().min(0).max(100).optional(),
    segmentation: z.nativeEnum(StakeholderSegmentation).optional(),
    category: z.nativeEnum(StakeholderCategory).optional()
})

/**
 * GET /api/stakeholders
 *
 * Returns all stakeholders that match the query parameters
 *
 * GET /api/stakeholders?name&statement&solutionId
 *
 * Returns all stakeholders that match the query parameters
 */
export default defineEventHandler(async (event) => {
    const query = await getValidatedQuery(event, (q) => querySchema.safeParse(q)),
        em = fork()

    if (!query.success)
        throw createError({
            statusCode: 400,
            statusMessage: "Bad Request: Invalid query parameters"
        })

    const results = await em.find(Stakeholder, Object.entries(query.data)
        .filter(([_, value]) => value !== undefined)
        .reduce((acc, [key, value]) => {
            if (key.endsWith("Id"))
                return { ...acc, [key.replace("Id", "")]: value as Uuid };
            return { ...acc, [key]: { $eq: value } };
        }, {} as Record<string, any>));

    return results
})
