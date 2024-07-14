import { z } from "zod"
import StakeholderRepository from "~/server/data/repositories/StakeholderRepository"
import StakeholderInteractor from "~/server/application/StakeholderInteractor"

const querySchema = z.object({
    name: z.string().optional(),
    statement: z.string().optional(),
    solutionId: z.string().optional(),
    parentComponentId: z.string().uuid().optional(),
    availability: z.number().optional(),
    influence: z.number().optional(),
    segmentationId: z.enum(["CLIENT", "VENDOR"]).optional(),
    categoryId: z.enum(["KEY_STAKEHOLDER", "SHADOW_INFLUENCER", "FELLOW_TRAVELER", "OBSERVER"]).optional()
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
    const stakeholderInteractor = new StakeholderInteractor(new StakeholderRepository()),
        query = await getValidatedQuery(event, (q) => querySchema.safeParse(q))

    if (!query.success)
        throw createError({
            statusCode: 400,
            statusMessage: "Bad Request: Invalid query parameters"
        })

    return stakeholderInteractor.getAll(
        Object.fromEntries(
            Object.entries(query.data)
                .filter(([_, v]) => v !== undefined)
        )
    )
})
