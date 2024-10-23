import { z } from "zod"
import { MoscowPriority, Outcome, Stakeholder, FunctionalBehavior, UserStory } from "~/domain/requirements/index.js"
import { fork } from "~/server/data/orm.js"
import { Belongs } from "~/domain/relations"

const bodySchema = z.object({
    solutionId: z.string().uuid(),
    name: z.string().default("{Untitled User Story}"),
    description: z.string().default(""),
    primaryActor: z.string().uuid().optional(),
    priority: z.nativeEnum(MoscowPriority).default(MoscowPriority.MUST),
    outcome: z.string().uuid().optional(),
    functionalBehavior: z.string().uuid().optional(),
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
        functionalBehavior: body.functionalBehavior ? em.getReference(FunctionalBehavior, body.functionalBehavior) : undefined,
        outcome: body.outcome ? em.getReference(Outcome, body.outcome) : undefined,
        name: body.name,
        description: body.description,
        primaryActor: body.primaryActor ? em.getReference(Stakeholder, body.primaryActor) : undefined,
        priority: body.priority,
        lastModified: new Date(),
        modifiedBy: sessionUser,
        isSilence: body.isSilence
    })

    em.create(Belongs, { left: newUserStory, right: solution })

    await em.flush()

    return newUserStory.id
})