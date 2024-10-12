import { z } from "zod"
import { fork } from "~/server/data/orm.js"
import { Assumption, Effect, MoscowPriority, Stakeholder, UseCase } from "~/server/domain/index.js"

const paramSchema = z.object({
    id: z.string().uuid()
})

const bodySchema = z.object({
    solutionId: z.string().uuid(),
    name: z.string().optional(),
    statement: z.string().optional(),
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
        { sessionUser } = await assertSolutionContributor(event, body.solutionId),
        em = fork(),
        useCase = await em.findOne(UseCase, id)

    if (!useCase)
        throw createError({
            statusCode: 400,
            statusMessage: `Bad Request: No use case found with id: ${id}`
        })

    if (body.primaryActorId)
        useCase.primaryActor = em.getReference(Stakeholder, body.primaryActorId)
    if (body.preconditionId)
        useCase.precondition = em.getReference(Assumption, body.preconditionId)
    if (body.successGuaranteeId)
        useCase.successGuarantee = em.getReference(Effect, body.successGuaranteeId)

    Object.assign(useCase, {
        name: body.name ?? useCase.name,
        statement: body.statement ?? useCase.statement,
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