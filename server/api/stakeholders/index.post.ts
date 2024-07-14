import { type Uuid, emptyUuid } from "~/server/domain/Uuid"
import { z } from "zod"
import StakeholderRepository from "~/server/data/repositories/StakeholderRepository"
import StakeholderInteractor from "~/server/application/StakeholderInteractor"

const bodySchema = z.object({
    name: z.string(),
    statement: z.string(),
    solutionId: z.string(),
    // parentComponentId: z.string().uuid(),
    availability: z.number(),
    influence: z.number(),
    segmentationId: z.enum(["CLIENT", "VENDOR"]),
    categoryId: z.enum(["KEY_STAKEHOLDER", "SHADOW_INFLUENCER", "FELLOW_TRAVELER", "OBSERVER"])
})

/**
 * Creates a new stakeholder and returns its id
 */
export default defineEventHandler(async (event) => {
    const stakeholderInteractor = new StakeholderInteractor(new StakeholderRepository()),
        body = await readValidatedBody(event, (b) => bodySchema.safeParse(b))

    if (!body.success)
        throw createError({
            statusCode: 400,
            statusMessage: "Bad Request: Invalid body parameters"
        })

    return stakeholderInteractor.create({
        name: body.data.name,
        statement: body.data.statement,
        solutionId: body.data.solutionId as Uuid,
        availability: body.data.availability,
        influence: body.data.influence,
        categoryId: body.data.categoryId,
        // parentComponentId: body.data.parentComponentId as Uuid,
        parentComponentId: emptyUuid,
        segmentationId: body.data.segmentationId
    })
})