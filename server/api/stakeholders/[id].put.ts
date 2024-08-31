import { z } from "zod"
import { fork } from "~/server/data/orm"
import Solution from "~/server/domain/application/Solution"
import { Stakeholder, StakeholderCategory, StakeholderSegmentation } from "~/server/domain/requirements/index"

const bodySchema = z.object({
    name: z.string(),
    statement: z.string(),
    solutionId: z.string().uuid(),
    parentComponentId: z.string().uuid().optional(),
    availability: z.number().min(0).max(100),
    influence: z.number().min(0).max(100),
    segmentation: z.nativeEnum(StakeholderSegmentation),
    category: z.nativeEnum(StakeholderCategory)
})

/**
 * PUT /api/stakeholders/:id
 *
 * Updates a stakeholder by id.
 */
export default defineEventHandler(async (event) => {
    const id = event.context.params?.id,
        body = await readValidatedBody(event, (b) => bodySchema.safeParse(b)),
        em = fork()

    if (!body.success)
        throw createError({
            statusCode: 400,
            statusMessage: 'Bad Request: Invalid body parameters',
            message: JSON.stringify(body.error.errors)
        })

    if (id) {
        const stakeholder = await em.findOne(Stakeholder, id),
            solution = await em.findOne(Solution, body.data.solutionId),
            parentStakeholder = body.data.parentComponentId ?
                await em.findOne(Stakeholder, body.data.parentComponentId)
                : undefined

        if (!stakeholder)
            throw createError({
                statusCode: 400,
                statusMessage: `Bad Request: No stakeholder found with id: ${id}`
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
        stakeholder.segmentation = body.data.segmentation
        stakeholder.category = body.data.category
        stakeholder.parentComponent = parentStakeholder || undefined

        await em.flush()
    } else {
        throw createError({
            statusCode: 400,
            statusMessage: "Bad Request: id is required."
        })
    }
})