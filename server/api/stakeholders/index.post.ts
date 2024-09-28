import { z } from "zod"
import { fork } from "~/server/data/orm"
import { Stakeholder, StakeholderCategory, StakeholderSegmentation } from "~/server/domain/requirements/index.js"

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
 * Creates a new stakeholder and returns its id
 */
export default defineEventHandler(async (event) => {
    const { availability, category, influence, name, segmentation, statement, parentComponentId, solutionId }
        = await validateEventBody(event, bodySchema),
        { solution, sessionUser } = await assertSolutionContributor(event, solutionId),
        em = fork()

    const parentStakeholder = parentComponentId ?
        await em.findOne(Stakeholder, parentComponentId)
        : undefined

    const newStakeholder = new Stakeholder({
        name,
        statement,
        solution,
        parentComponent: parentStakeholder ?? undefined,
        availability,
        influence,
        segmentation,
        category,
        lastModified: new Date(),
        modifiedBy: sessionUser
    })

    await em.persistAndFlush(newStakeholder)

    return newStakeholder.id
})