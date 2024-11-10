import { z } from "zod"
import { fork } from "~/server/data/orm.js"
import { Belongs } from "~/domain/relations"
import { Stakeholder, StakeholderSegmentation, StakeholderCategory } from "~/domain/requirements/index.js"

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
        stakeholder = await assertReqBelongsToSolution(em, Stakeholder, id, solution),
        parentComponent = parentComponentId ? await assertReqBelongsToSolution(em, Stakeholder, parentComponentId, solution) : undefined

    const existingParentComponent = await em.findOne(Belongs, {
        left: stakeholder,
        right: parentComponent
    })

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

    if (!existingParentComponent && parentComponent) {
        em.create(Belongs, { left: stakeholder, right: parentComponent })
    } else if (existingParentComponent && !parentComponent) {
        em.remove(existingParentComponent)
    } else if (existingParentComponent && parentComponent) {
        em.remove(existingParentComponent)
        em.create(Belongs, { left: stakeholder, right: parentComponent })
    } else {
        // Do nothing
    }

    // If the entity is no longer silent and has no reqId, assume
    // that it is a new requirement from the workbox
    if (isSilence !== undefined && isSilence == false && !stakeholder.reqId)
        stakeholder.reqId = await getNextReqId(Stakeholder.reqIdPrefix, em, solution) as Stakeholder['reqId']

    await em.persistAndFlush(stakeholder)
})