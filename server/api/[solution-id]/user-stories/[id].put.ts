import { z } from "zod"
import { fork } from "~/server/data/orm"
import { FunctionalBehavior, MoscowPriority, Outcome, Stakeholder, UserStory } from "~/server/domain/requirements/index.js"

const paramSchema = z.object({
    solutionId: z.string().uuid(),
    id: z.string().uuid()
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
 * Updates a User Story by id
 */
export default defineEventHandler(async (event) => {
    const { id, solutionId } = await validateEventParams(event, paramSchema),
        { sessionUser } = await assertSolutionContributor(event, solutionId),
        body = await validateEventBody(event, bodySchema),
        em = fork()

    const userStory = await em.findOne(UserStory, id),
        primaryActor = await em.findOne(Stakeholder, body.primaryActorId),
        outcome = await em.findOne(Outcome, body.outcomeId),
        functionalBehavior = await em.findOne(FunctionalBehavior, body.functionalBehaviorId)

    if (!userStory)
        throw createError({
            statusCode: 400,
            statusMessage: `Bad Request: No user story found with id: ${id}`
        })
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

    userStory.name = body.name
    userStory.statement = body.statement
    userStory.primaryActor = primaryActor
    userStory.priority = body.priority
    userStory.outcome = outcome
    userStory.functionalBehavior = functionalBehavior
    userStory.modifiedBy = sessionUser

    await em.flush()
})