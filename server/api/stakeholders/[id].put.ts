import { z } from "zod"
import { fork } from "~/server/data/orm.js"
import { Stakeholder, StakeholderSegmentation, StakeholderCategory } from "~/server/domain/requirements/index.js"

const paramSchema = z.object({
    id: z.string().uuid()
})

const bodySchema = z.object({
    solutionId: z.string().uuid(),
    name: z.string().optional(),
    description: z.string().optional(),
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
        { availability, category, influence, name, segmentation, description, parentComponentId, solutionId, isSilence } =
            await validateEventBody(event, bodySchema),
        { sessionUser, solution } = await assertSolutionContributor(event, solutionId),
        em = fork(),
        stakeholder = await assertReqBelongsToSolution(em, Stakeholder, id, solution)


    if (parentComponentId)
        stakeholder.parentComponent = await assertReqBelongsToSolution(em, Stakeholder, parentComponentId, solution)

    stakeholder.assign({
        name: name ?? stakeholder.name,
        description: description ?? stakeholder.description,
        availability: availability ?? stakeholder.availability,
        influence: influence ?? stakeholder.influence,
        segmentation: segmentation ?? stakeholder.segmentation,
        category: category ?? stakeholder.category,
        isSilence: isSilence ?? stakeholder.isSilence,
        modifiedBy: sessionUser,
        lastModified: new Date()
    })

    await em.flush()
})