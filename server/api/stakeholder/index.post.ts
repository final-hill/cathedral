import { z } from "zod"
import { fork } from "~/server/data/orm.js"
import { Stakeholder, StakeholderCategory, StakeholderSegmentation } from "~/server/domain/requirements/index.js"
import { Belongs } from "~/server/domain/relations"

const bodySchema = z.object({
    solutionId: z.string().uuid(),
    name: z.string().default("{Untitled Stakeholder}"),
    description: z.string().default(""),
    parentComponentId: z.string().uuid().optional(),
    availability: z.number().min(0).max(100).default(50),
    influence: z.number().min(0).max(100).default(50),
    segmentation: z.nativeEnum(StakeholderSegmentation).optional(),
    category: z.nativeEnum(StakeholderCategory).optional(),
    isSilence: z.boolean().default(false)
})

/**
 * Creates a new stakeholder and returns its id
 */
export default defineEventHandler(async (event) => {
    const { availability, category, influence, name, segmentation, description, solutionId, isSilence, parentComponentId }
        = await validateEventBody(event, bodySchema),
        { solution, sessionUser } = await assertSolutionContributor(event, solutionId),
        em = fork()

    const newStakeholder = em.create(Stakeholder, {
        name,
        description,
        availability,
        influence,
        segmentation,
        category,
        lastModified: new Date(),
        modifiedBy: sessionUser,
        isSilence
    })

    em.create(Belongs, { left: newStakeholder, right: solution })

    if (parentComponentId)
        em.create(Belongs, { left: newStakeholder, right: parentComponentId })

    await em.flush()

    return newStakeholder.id
})