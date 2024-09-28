import { z } from "zod"
import { fork } from "~/server/data/orm"
import { FunctionalBehavior, MoscowPriority, Outcome, Stakeholder, UserStory } from "~/server/domain/requirements/index.js"

const paramSchema = z.object({
    id: z.string().uuid()
})

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
 * Updates a User Story by id
 */
export default defineEventHandler(async (event) => {
    const { id } = await validateEventParams(event, paramSchema),
        body = await validateEventBody(event, bodySchema),
        { sessionUser } = await assertSolutionContributor(event, body.solutionId),
        em = fork()

    const userStory = await em.findOne(UserStory, id),
        primaryActor = body.primaryActorId ? await em.findOne(Stakeholder, body.primaryActorId) : undefined,
        outcome = body.outcomeId ? await em.findOne(Outcome, body.outcomeId) : undefined,
        functionalBehavior = body.functionalBehaviorId ? await em.findOne(FunctionalBehavior, body.functionalBehaviorId) : undefined

    if (!userStory)
        throw createError({
            statusCode: 400,
            statusMessage: `Bad Request: No user story found with id: ${id}`
        })

    userStory.name = body.name
    userStory.statement = body.statement
    userStory.primaryActor = primaryActor ?? undefined
    userStory.priority = body.priority
    userStory.outcome = outcome ?? undefined
    userStory.functionalBehavior = functionalBehavior ?? undefined
    userStory.modifiedBy = sessionUser

    await em.flush()
})