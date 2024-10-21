import { z } from "zod"
import { fork } from "~/server/data/orm.js"
import { FunctionalBehavior, MoscowPriority, Outcome, Stakeholder, UserStory } from "~/server/domain/requirements/index.js"

const paramSchema = z.object({
    id: z.string().uuid()
})

const bodySchema = z.object({
    solutionId: z.string().uuid(),
    name: z.string().optional(),
    description: z.string().optional(),
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
        { sessionUser, solution } = await assertSolutionContributor(event, body.solutionId),
        em = fork(),
        userStory = await assertReqBelongsToSolution(em, UserStory, id, solution)

    if (body.primaryActorId)
        userStory.primaryActor = await assertReqBelongsToSolution(em, Stakeholder, body.primaryActorId, solution)
    if (body.outcomeId)
        userStory.outcome = await assertReqBelongsToSolution(em, Outcome, body.outcomeId, solution)
    if (body.functionalBehaviorId)
        userStory.functionalBehavior = await assertReqBelongsToSolution(em, FunctionalBehavior, body.functionalBehaviorId, solution)

    userStory.assign({
        name: body.name ?? userStory.name,
        description: body.description ?? userStory.description,
        priority: body.priority ?? userStory.priority,
        isSilence: body.isSilence ?? userStory.isSilence,
        modifiedBy: sessionUser,
        lastModified: new Date()
    })

    await em.flush()
})