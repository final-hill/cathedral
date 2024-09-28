import { z } from "zod"
import { fork } from "~/server/data/orm"
import { Stakeholder, StakeholderSegmentation, StakeholderCategory } from "~/server/domain/requirements/index.js"

const paramSchema = z.object({
    id: z.string().uuid()
})

const bodySchema = z.object({
    solutionId: z.string().uuid(),
    name: z.string().default("{Untitled Stakeholder}"),
    statement: z.string().default(""),
    parentComponentId: z.string().uuid().optional(),
    availability: z.number().min(0).max(100).default(50),
    influence: z.number().min(0).max(100).default(50),
    segmentation: z.nativeEnum(StakeholderSegmentation).optional(),
    category: z.nativeEnum(StakeholderCategory).optional()
})

/**
 * Updates a stakeholder by id.
 */
export default defineEventHandler(async (event) => {
    const { id } = await validateEventParams(event, paramSchema),
        { availability, category, influence, name, segmentation, statement, parentComponentId, solutionId } =
            await validateEventBody(event, bodySchema),
        { sessionUser } = await assertSolutionContributor(event, solutionId),
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