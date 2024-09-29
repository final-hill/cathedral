import { z } from "zod"
import { MoscowPriority, Outcome, Stakeholder, FunctionalBehavior, UserStory } from "~/server/domain/requirements/index.js"
import { fork } from "~/server/data/orm"

const bodySchema = z.object({
    solutionId: z.string().uuid(),
    name: z.string().default("{Untitled User Story}"),
    statement: z.string().default(""),
    primaryActorId: z.string().uuid().optional(),
    priority: z.nativeEnum(MoscowPriority).optional(),
    outcomeId: z.string().uuid().optional(),
    functionalBehaviorId: z.string().uuid().optional()
})

/**
 * Creates a new user story and returns its id
 */
export default defineEventHandler(async (event) => {
    const body = await validateEventBody(event, bodySchema),
        { solution, sessionUser } = await assertSolutionContributor(event, body.solutionId),
        em = fork()

    const [primaryActor, outcome, functionalBehavior] = await Promise.all([
        body.primaryActorId ? em.findOne(Stakeholder, body.primaryActorId) : undefined,
        body.outcomeId ? em.findOne(Outcome, body.outcomeId) : undefined,
        body.functionalBehaviorId ? em.findOne(FunctionalBehavior, body.functionalBehaviorId) : undefined
    ]);

    const newUserStory = new UserStory({
        functionalBehavior: functionalBehavior ?? undefined,
        outcome: outcome ?? undefined,
        name: body.name,
        statement: body.statement,
        solution,
        primaryActor: primaryActor ?? undefined,
        priority: body.priority,
        lastModified: new Date(),
        modifiedBy: sessionUser
    })

    await em.persistAndFlush(newUserStory)

    return newUserStory.id
})