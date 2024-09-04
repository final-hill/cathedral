import { z } from "zod"
import { MoscowPriority, Outcome, Stakeholder, FunctionalBehavior, UserStory } from "~/server/domain/requirements/index.js"
import { fork } from "~/server/data/orm"

const paramSchema = z.object({
    solutionId: z.string().uuid()
})

const bodySchema = z.object({
    name: z.string(),
    statement: z.string(),
    primaryActorId: z.string().uuid(),
    priority: z.nativeEnum(MoscowPriority),
    outcomeId: z.string().uuid(),
    functionalBehaviorId: z.string().uuid()
})

/**
 * Creates a new user story and returns its id
 */
export default defineEventHandler(async (event) => {
    const { solutionId } = await validateEventParams(event, paramSchema),
        body = await validateEventBody(event, bodySchema),
        { solution, sessionUser } = await assertSolutionContributor(event, solutionId),
        em = fork()

    const [primaryActor, outcome, functionalBehavior] = await Promise.all([
        em.findOne(Stakeholder, body.primaryActorId),
        em.findOne(Outcome, body.outcomeId),
        em.findOne(FunctionalBehavior, body.functionalBehaviorId)
    ]);

    if (!primaryActor)
        throw createError({
            statusCode: 400,
            statusMessage: `Bad Request: No primary actor found with id: ${body.primaryActorId}`
        })
    if (!outcome)
        throw createError({
            statusCode: 400,
            statusMessage: `Bad Request: No outcome found with id: ${body.outcomeId}`
        })
    if (!functionalBehavior)
        throw createError({
            statusCode: 400,
            statusMessage: `Bad Request: No functional behavior found with id: ${body.functionalBehaviorId}`
        })

    const newUserStory = new UserStory({
        functionalBehavior,
        outcome,
        name: body.name,
        statement: body.statement,
        solution,
        primaryActor,
        priority: body.priority,
        lastModified: new Date(),
        modifiedBy: sessionUser
    })

    await em.persistAndFlush(newUserStory)

    return newUserStory.id
})