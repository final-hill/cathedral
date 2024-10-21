import { z } from "zod"
import { fork } from "~/server/data/orm.js"
import { Assumption, Effect, MoscowPriority, Stakeholder, UseCase } from "~/server/domain/requirements/index.js"

const paramSchema = z.object({
    id: z.string().uuid()
})

const bodySchema = z.object({
    solutionId: z.string().uuid(),
    name: z.string().optional(),
    description: z.string().optional(),
    primaryActorId: z.string().uuid().optional(),
    priority: z.nativeEnum(MoscowPriority).optional(),
    scope: z.string().optional(),
    level: z.string().optional(),
    goalInContext: z.string().optional(),
    preconditionId: z.string().uuid().optional(),
    triggerId: z.string().uuid().optional(),
    mainSuccessScenario: z.string().optional(),
    successGuaranteeId: z.string().uuid().optional(),
    extensions: z.string().optional(),
    isSilence: z.boolean().optional()
})

/**
 * Updates a UseCase by id
 */
export default defineEventHandler(async (event) => {
    const { id } = await validateEventParams(event, paramSchema),
        body = await validateEventBody(event, bodySchema),
        { sessionUser, solution } = await assertSolutionContributor(event, body.solutionId),
        em = fork(),
        useCase = await assertReqBelongsToSolution(em, UseCase, id, solution)

    if (body.primaryActorId)
        useCase.primaryActor = await assertReqBelongsToSolution(em, Stakeholder, body.primaryActorId, solution)
    if (body.preconditionId)
        useCase.precondition = await assertReqBelongsToSolution(em, Assumption, body.preconditionId, solution)
    if (body.successGuaranteeId)
        useCase.successGuarantee = await assertReqBelongsToSolution(em, Effect, body.successGuaranteeId, solution)

    useCase.assign({
        name: body.name ?? useCase.name,
        description: body.description ?? useCase.description,
        priority: body.priority ?? useCase.priority,
        scope: body.scope ?? useCase.scope,
        level: body.level ?? useCase.level,
        goalInContext: body.goalInContext ?? useCase.goalInContext,
        triggerId: body.triggerId ?? useCase.triggerId,
        mainSuccessScenario: body.mainSuccessScenario ?? useCase.mainSuccessScenario,
        extensions: body.extensions ?? useCase.extensions,
        isSilence: body.isSilence ?? useCase.isSilence,
        modifiedBy: sessionUser,
        lastModified: new Date()
    })

    await em.flush()
})