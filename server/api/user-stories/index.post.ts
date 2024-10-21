import { z } from "zod"
import { MoscowPriority, Outcome, Stakeholder, FunctionalBehavior, UserStory } from "~/server/domain/requirements/index.js"
import { fork } from "~/server/data/orm.js"
import { Belongs } from "~/server/domain/relations"

const bodySchema = z.object({
    solutionId: z.string().uuid(),
    name: z.string().default("{Untitled User Story}"),
    description: z.string().default(""),
    primaryActorId: z.string().uuid().optional(),
    priority: z.nativeEnum(MoscowPriority).default(MoscowPriority.MUST),
    outcomeId: z.string().uuid().optional(),
    functionalBehaviorId: z.string().uuid().optional(),
    isSilence: z.boolean().default(false)
})

/**
 * Creates a new user story and returns its id
 */
export default defineEventHandler(async (event) => {
    const body = await validateEventBody(event, bodySchema),
        { solution, sessionUser } = await assertSolutionContributor(event, body.solutionId),
        em = fork()

    const newUserStory = new UserStory({
        functionalBehavior: body.functionalBehaviorId ? em.getReference(FunctionalBehavior, body.functionalBehaviorId) : undefined,
        outcome: body.outcomeId ? em.getReference(Outcome, body.outcomeId) : undefined,
        name: body.name,
        description: body.description,
        primaryActor: body.primaryActorId ? em.getReference(Stakeholder, body.primaryActorId) : undefined,
        priority: body.priority,
        lastModified: new Date(),
        modifiedBy: sessionUser,
        isSilence: body.isSilence
    })

    em.create(Belongs, { left: newUserStory, right: solution })

    await em.flush()

    return newUserStory.id
})