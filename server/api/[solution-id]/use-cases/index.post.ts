import { NIL as emptyUuid } from "uuid"
import { z } from "zod"
import { MoscowPriority, Stakeholder, Assumption, Effect, UseCase } from "~/server/domain/requirements/index.js"
import { fork } from "~/server/data/orm"

const paramSchema = z.object({
    solutionId: z.string().uuid()
})

const bodySchema = z.object({
    name: z.string(),
    statement: z.string(),
    primaryActorId: z.string().uuid(),
    priority: z.nativeEnum(MoscowPriority),
    scope: z.string(),
    level: z.string(),
    goalInContext: z.string(),
    preconditionId: z.string().uuid(),
    triggerId: z.literal(emptyUuid),
    mainSuccessScenario: z.string(),
    successGuaranteeId: z.string().uuid(),
    extensions: z.string()
})

/**
 * Creates a new use case and returns its id
 */
export default defineEventHandler(async (event) => {
    const { solutionId } = await validateEventParams(event, paramSchema),
        body = await validateEventBody(event, bodySchema),
        { solution, sessionUser } = await assertSolutionContributor(event, solutionId),
        em = fork()

    const primaryActor = await em.findOne(Stakeholder, body.primaryActorId),
        precondition = await em.findOne(Assumption, body.preconditionId),
        successGuarantee = await em.findOne(Effect, body.successGuaranteeId)

    if (!primaryActor)
        throw createError({
            statusCode: 400,
            statusMessage: `Bad Request: No primary actor found with id: ${body.primaryActorId}`
        })
    if (!precondition)
        throw createError({
            statusCode: 400,
            statusMessage: `Bad Request: No precondition found with id: ${body.preconditionId}`
        })
    if (!successGuarantee)
        throw createError({
            statusCode: 400,
            statusMessage: `Bad Request: No success guarantee found with id: ${body.successGuaranteeId}`
        })

    const newUseCase = new UseCase({
        name: body.name,
        statement: body.statement,
        solution,
        primaryActor,
        priority: body.priority,
        scope: body.scope,
        level: body.level,
        goalInContext: body.goalInContext,
        precondition,
        triggerId: body.triggerId,
        mainSuccessScenario: body.mainSuccessScenario,
        successGuarantee,
        extensions: body.extensions,
        lastModified: new Date(),
        modifiedBy: sessionUser
    })

    await em.persistAndFlush(newUseCase)

    return newUseCase.id
})