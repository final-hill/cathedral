import { z } from "zod"
import { fork } from "~/server/data/orm.js"
import { FunctionalBehavior, MoscowPriority, Outcome, Stakeholder, UserStory } from "~/server/domain/index.js"

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
    functionalBehaviorId: z.string().uuid().optional(),
    isSilence: z.boolean().optional()
})

/**
 * Updates a User Story by id
 */
export default defineEventHandler(async (event) => {
    const { id } = await validateEventParams(event, paramSchema),
        body = await validateEventBody(event, bodySchema),
        { sessionUser } = await assertSolutionContributor(event, body.solutionId),
        em = fork(),
        userStory = await em.findOne(UserStory, id)

    if (!userStory)
        throw createError({
            statusCode: 400,
            statusMessage: `Bad Request: No user story found with id: ${id}`
        })

    if (body.primaryActorId)
        userStory.primaryActor = em.getReference(Stakeholder, body.primaryActorId)
    if (body.outcomeId)
        userStory.outcome = em.getReference(Outcome, body.outcomeId)
    if (body.functionalBehaviorId)
        userStory.functionalBehavior = em.getReference(FunctionalBehavior, body.functionalBehaviorId)

    Object.assign(userStory, {
        name: body.name,
        statement: body.statement,
        priority: body.priority,
        modifiedBy: sessionUser,
        lastModified: new Date(),
        ...(body.isSilence !== undefined && { isSilence: body.isSilence })
    })

    await em.persistAndFlush(userStory)
})