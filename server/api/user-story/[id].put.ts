import { z } from "zod"
import { fork } from "~/server/data/orm.js"
import { FunctionalBehavior, MoscowPriority, Outcome, Stakeholder, UserStory, userStoryReqIdPrefix } from "~/domain/requirements/index.js"

const paramSchema = z.object({
    id: z.string().uuid()
})

const bodySchema = z.object({
    solutionId: z.string().uuid(),
    name: z.string().optional(),
    description: z.string().optional(),
    primaryActor: z.string().uuid().optional(),
    priority: z.nativeEnum(MoscowPriority).optional(),
    outcome: z.string().uuid().optional(),
    functionalBehavior: z.string().uuid().optional(),
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

    if (body.primaryActor)
        userStory.primaryActor = await assertReqBelongsToSolution(em, Stakeholder, body.primaryActor, solution)
    if (body.outcome)
        userStory.outcome = await assertReqBelongsToSolution(em, Outcome, body.outcome, solution)
    if (body.functionalBehavior)
        userStory.functionalBehavior = await assertReqBelongsToSolution(em, FunctionalBehavior, body.functionalBehavior, solution)

    userStory.assign({
        name: body.name ?? userStory.name,
        description: body.description ?? userStory.description,
        priority: body.priority ?? userStory.priority,
        isSilence: body.isSilence ?? userStory.isSilence,
        modifiedBy: sessionUser,
        lastModified: new Date()
    })

    // If the entity is no longer silent and has no reqId, assume
    // that it is a new requirement from the workbox
    if (body.isSilence !== undefined && body.isSilence == false && !userStory.reqId)
        userStory.reqId = await getNextReqId(userStoryReqIdPrefix, em, solution) as UserStory['reqId']

    await em.persistAndFlush(userStory)
})