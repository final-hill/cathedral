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
    primaryActor: z.string().uuid().optional(),
    priority: z.nativeEnum(MoscowPriority).optional(),
    scope: z.string().optional(),
    level: z.string().optional(),
    goalInContext: z.string().optional(),
    precondition: z.string().uuid().optional(),
    triggerId: z.string().uuid().optional(),
    mainSuccessScenario: z.string().optional(),
    successGuarantee: z.string().uuid().optional(),
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

    if (body.primaryActor)
        useCase.primaryActor = await assertReqBelongsToSolution(em, Stakeholder, body.primaryActor, solution)
    if (body.precondition)
        useCase.precondition = await assertReqBelongsToSolution(em, Assumption, body.precondition, solution)
    if (body.successGuarantee)
        useCase.successGuarantee = await assertReqBelongsToSolution(em, Effect, body.successGuarantee, solution)

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

    await em.persistAndFlush(useCase)
})