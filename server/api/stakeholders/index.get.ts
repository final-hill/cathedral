import { z } from "zod"
import orm from "~/server/data/orm"
import Stakeholder, { StakeholderCategory, StakeholderSegmentation } from "~/server/domain/Stakeholder"

const querySchema = z.object({
    name: z.string().optional(),
    statement: z.string().optional(),
    solutionId: z.string().uuid().optional(),
    parentComponentId: z.string().uuid().optional(),
    availability: z.number().min(0).max(100).optional(),
    influence: z.number().min(0).max(100).optional(),
    segmentationId: z.nativeEnum(StakeholderSegmentation).optional(),
    categoryId: z.nativeEnum(StakeholderCategory).optional()
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
    const query = await getValidatedQuery(event, (q) => querySchema.safeParse(q))

    if (!query.success)
        throw createError({
            statusCode: 400,
            statusMessage: "Bad Request: Invalid query parameters"
        })

    const results = await orm.em.findAll(Stakeholder, {
        where: Object.fromEntries(
            Object.entries(query.data)
                .filter(([_, v]) => v !== undefined)
                .map(([k, v]) => [k, { $eq: v }])
        )
    })

    return results
})
