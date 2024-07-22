import { z } from "zod"
import { fork } from "~/server/data/orm"
import Solution from "~/server/domain/Solution"
import Stakeholder from "~/server/domain/Stakeholder"
import StakeholderSegmentation from "~/server/domain/StakeholderSegmentation"
import StakeholderCategory from "~/server/domain/StakeholderCategory"
import { type Uuid } from "~/server/domain/Uuid"

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
 * Creates a new stakeholder and returns its id
 */
export default defineEventHandler(async (event) => {
    const body = await readValidatedBody(event, (b) => bodySchema.safeParse(b)),
        em = fork()

    if (!body.success)
        throw createError({
            statusCode: 400,
            statusMessage: 'Bad Request: Invalid body parameters',
            message: JSON.stringify(body.error.errors)
        })

    const solution = await em.findOne(Solution, body.data.solutionId as Uuid),
        parentStakeholder = body.data.parentComponentId ?
            await em.findOne(Stakeholder, body.data.parentComponentId as Uuid)
            : undefined

    if (!solution)
        throw createError({
            statusCode: 400,
            statusMessage: `Bad Request: Solution not found for id ${body.data.solutionId}`
        })

    const newStakeholder = new Stakeholder({
        name: body.data.name,
        statement: body.data.statement,
        solution,
        parentComponent: parentStakeholder ?? undefined,
        availability: body.data.availability,
        influence: body.data.influence,
        segmentation: body.data.segmentation,
        category: body.data.category
    })

    await em.persistAndFlush(newStakeholder)

    return newStakeholder.id
})