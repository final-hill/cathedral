import { z } from "zod"
import { fork } from "~/server/data/orm.js"
import { Stakeholder, StakeholderSegmentation, StakeholderCategory } from "~/server/domain/index.js"

const paramSchema = z.object({
    id: z.string().uuid()
})

const bodySchema = z.object({
    solutionId: z.string().uuid(),
    name: z.string().optional(),
    statement: z.string().optional(),
    parentComponentId: z.string().uuid().optional(),
    availability: z.number().min(0).max(100).optional(),
    influence: z.number().min(0).max(100).optional(),
    segmentation: z.nativeEnum(StakeholderSegmentation).optional(),
    category: z.nativeEnum(StakeholderCategory).optional(),
    isSilence: z.boolean().optional()
})

/**
 * Updates a stakeholder by id.
 */
export default defineEventHandler(async (event) => {
    const { id } = await validateEventParams(event, paramSchema),
        { availability, category, influence, name, segmentation, statement, parentComponentId, solutionId, isSilence } =
            await validateEventBody(event, bodySchema),
        { sessionUser } = await assertSolutionContributor(event, solutionId),
        em = fork(),
        stakeholder = await em.findOne(Stakeholder, id);

    if (!stakeholder)
        throw createError({
            statusCode: 400,
            statusMessage: `Bad Request: No stakeholder found with id: ${id}`
        })

    if (parentComponentId)
        stakeholder.parentComponent = em.getReference(Stakeholder, parentComponentId)

    Object.assign(stakeholder, {
        name: name ?? stakeholder.name,
        statement: statement ?? stakeholder.statement,
        availability: availability ?? stakeholder.availability,
        influence: influence ?? stakeholder.influence,
        segmentation: segmentation ?? stakeholder.segmentation,
        category: category ?? stakeholder.category,
        isSilence: isSilence ?? stakeholder.isSilence,
        modifiedBy: sessionUser,
        lastModified: new Date()
    })

    await em.persistAndFlush(stakeholder)
})