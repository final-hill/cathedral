import { z } from "zod"
import { fork } from "~/server/data/orm"
import { Assumption, Effect, MoscowPriority, Stakeholder, UseCase } from "~/server/domain/requirements/index.js"
import { NIL as emptyUuid } from "uuid"

const paramSchema = z.object({
    solutionId: z.string().uuid(),
    id: z.string().uuid()
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
 * Updates a UseCase by id
 */
export default defineEventHandler(async (event) => {
    const { id, solutionId } = await validateEventParams(event, paramSchema),
        { sessionUser } = await assertSolutionContributor(event, solutionId),
        body = await validateEventBody(event, bodySchema),
        em = fork()

    const useCase = await em.findOne(UseCase, id),
        primaryActor = await em.findOne(Stakeholder, body.primaryActorId),
        precondition = await em.findOne(Assumption, body.preconditionId),
        successGuarantee = await em.findOne(Effect, body.successGuaranteeId)

    if (!useCase)
        throw createError({
            statusCode: 400,
            statusMessage: `Bad Request: No use case found with id: ${id}`
        })
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

    useCase.name = body.name
    useCase.statement = body.statement
    useCase.primaryActor = primaryActor
    useCase.priority = body.priority
    useCase.scope = body.scope
    useCase.level = body.level
    useCase.goalInContext = body.goalInContext
    useCase.precondition = precondition
    useCase.triggerId = body.triggerId
    useCase.mainSuccessScenario = body.mainSuccessScenario
    useCase.successGuarantee = successGuarantee
    useCase.extensions = body.extensions
    useCase.modifiedBy = sessionUser

    await em.flush()
})