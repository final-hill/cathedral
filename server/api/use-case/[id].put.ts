import { z } from "zod"
import { fork } from "~/server/data/orm.js"
import { Assumption, Effect, MoscowPriority, Outcome, Stakeholder, UseCase, useCaseReqIdPrefix } from "~/domain/requirements/index.js"

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
    outcome: z.string().uuid().optional(),
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
    if (body.outcome)
        useCase.outcome = await assertReqBelongsToSolution(em, Outcome, body.outcome, solution)

    useCase.assign({
        name: body.name ?? useCase.name,
        description: body.description ?? useCase.description,
        priority: body.priority ?? useCase.priority,
        scope: body.scope ?? useCase.scope,
        level: body.level ?? useCase.level,
        outcome: body.outcome ?? useCase.outcome,
        triggerId: body.triggerId ?? useCase.triggerId,
        mainSuccessScenario: body.mainSuccessScenario ?? useCase.mainSuccessScenario,
        extensions: body.extensions ?? useCase.extensions,
        isSilence: body.isSilence ?? useCase.isSilence,
        modifiedBy: sessionUser,
        lastModified: new Date()
    })

    // If the entity is no longer silent and has no reqId, assume
    // that it is a new requirement from the workbox
    if (body.isSilence !== undefined && body.isSilence == false && !useCase.reqId)
        useCase.reqId = await getNextReqId(useCaseReqIdPrefix, em, solution) as UseCase['reqId']

    await em.persistAndFlush(useCase)
})