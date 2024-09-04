import { z } from "zod"
import { fork } from "~/server/data/orm"
import { Stakeholder, StakeholderSegmentation, StakeholderCategory } from "~/server/domain/requirements/index.js"

const paramSchema = z.object({
    solutionId: z.string().uuid(),
    id: z.string().uuid()
})

const bodySchema = z.object({
    name: z.string(),
    statement: z.string(),
    parentComponentId: z.string().uuid().optional(),
    availability: z.number().min(0).max(100),
    influence: z.number().min(0).max(100),
    segmentation: z.nativeEnum(StakeholderSegmentation),
    category: z.nativeEnum(StakeholderCategory)
})

/**
 * Updates a stakeholder by id.
 */
export default defineEventHandler(async (event) => {
    const { id, solutionId } = await validateEventParams(event, paramSchema),
        { sessionUser } = await assertSolutionContributor(event, solutionId),
        { availability, category, influence, name, segmentation, statement, parentComponentId } =
            await validateEventBody(event, bodySchema),
        em = fork()

    const stakeholder = await em.findOne(Stakeholder, id),
        parentStakeholder = parentComponentId ?
            await em.findOne(Stakeholder, parentComponentId)
            : undefined

    if (!stakeholder)
        throw createError({
            statusCode: 400,
            statusMessage: `Bad Request: No stakeholder found with id: ${id}`
        })

    stakeholder.name = name
    stakeholder.statement = statement
    stakeholder.availability = availability
    stakeholder.influence = influence
    stakeholder.segmentation = segmentation
    stakeholder.category = category
    stakeholder.parentComponent = parentStakeholder || undefined
    stakeholder.modifiedBy = sessionUser

    await em.flush()
})