import { z } from "zod"
import orm from "~/server/data/orm"
import Solution from "~/server/domain/Solution"
import Stakeholder, { StakeholderCategory, StakeholderSegmentation } from "~/server/domain/Stakeholder"

const bodySchema = z.object({
    name: z.string(),
    statement: z.string(),
    solutionId: z.string().uuid(),
    parentComponentId: z.string().uuid(),
    availability: z.number().min(0).max(100),
    influence: z.number().min(0).max(100),
    segmentationId: z.nativeEnum(StakeholderSegmentation),
    categoryId: z.nativeEnum(StakeholderCategory)
})

/**
 * PUT /api/stakeholders/:id
 *
 * Updates a stakeholder by id.
 */
export default defineEventHandler(async (event) => {
    const id = event.context.params?.id,
        body = await readValidatedBody(event, (b) => bodySchema.safeParse(b))

    if (!body.success)
        throw createError({
            statusCode: 400,
            statusMessage: "Bad Request: Invalid body parameters"
        })

    if (id) {
        const stakeholder = await orm.em.findOne(Stakeholder, id),
            solution = await orm.em.findOne(Solution, body.data.solutionId),
            parentStakeholder = await orm.em.findOne(Stakeholder, body.data.parentComponentId)

        if (!stakeholder)
            throw createError({
                statusCode: 400,
                statusMessage: `Bad Request: No assumption found with id: ${id}`
            })
        if (!solution)
            throw createError({
                statusCode: 400,
                statusMessage: `Bad Request: No solution found with id: ${body.data.solutionId}`
            })

        stakeholder.name = body.data.name
        stakeholder.statement = body.data.statement
        stakeholder.solution = solution
        stakeholder.availability = body.data.availability
        stakeholder.influence = body.data.influence
        stakeholder.segmentation = body.data.segmentationId
        stakeholder.category = body.data.categoryId
        stakeholder.parentComponent = parentStakeholder || undefined

        await orm.em.flush()
    } else {
        throw createError({
            statusCode: 400,
            statusMessage: "Bad Request: id is required."
        })
    }
})