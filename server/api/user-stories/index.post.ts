import { z } from "zod"
import { MoscowPriority, Outcome, Stakeholder, FunctionalBehavior, UserStory } from "~/server/domain/requirements/index.js"
import { fork } from "~/server/data/orm"

const bodySchema = z.object({
    solutionId: z.string().uuid(),
    name: z.string().default("{Untitled User Story}"),
    statement: z.string().default(""),
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
        statement: body.statement,
        solution,
        primaryActor: body.primaryActorId ? em.getReference(Stakeholder, body.primaryActorId) : undefined,
        priority: body.priority,
        lastModified: new Date(),
        modifiedBy: sessionUser,
        isSilence: body.isSilence
    })

    await em.persistAndFlush(newUserStory)

    return newUserStory.id
})