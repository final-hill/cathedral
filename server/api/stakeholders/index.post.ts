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
 * Creates a new stakeholder and returns its id
 */
export default defineEventHandler(async (event) => {
    const body = await readValidatedBody(event, (b) => bodySchema.safeParse(b))

    if (!body.success)
        throw createError({
            statusCode: 400,
            statusMessage: "Bad Request: Invalid body parameters"
        })

    const solution = await orm.em.findOne(Solution, body.data.solutionId),
        parentStakeholder = await orm.em.findOne(Stakeholder, body.data.parentComponentId)

    if (!solution)
        throw createError({
            statusCode: 400,
            statusMessage: `Bad Request: Solution not found for id ${body.data.solutionId}`
        })
    if (!parentStakeholder)
        throw createError({
            statusCode: 400,
            statusMessage: `Bad Request: Parent stakeholder not found for id ${body.data.parentComponentId}`
        })

    const newStakeholder = new Stakeholder({
        name: body.data.name,
        statement: body.data.statement,
        solution,
        parentComponent: parentStakeholder || undefined,
        availability: body.data.availability,
        influence: body.data.influence,
        segmentation: body.data.segmentationId,
        category: body.data.categoryId
    })

    await orm.em.persistAndFlush(newStakeholder)
})