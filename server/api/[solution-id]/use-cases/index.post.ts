import { NIL as emptyUuid } from "uuid"
import { z } from "zod"
import { fork } from "~/server/data/orm"
import Solution from "~/server/domain/application/Solution"
import { Assumption, MoscowPriority, Stakeholder } from "~/server/domain/requirements/index"
import { Effect } from "~/server/domain/requirements/index"
import { UseCase } from "~/server/domain/requirements/index"

const bodySchema = z.object({
    name: z.string(),
    statement: z.string(),
    solutionId: z.string().uuid(),
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
    const body = await readValidatedBody(event, (b) => bodySchema.safeParse(b)),
        em = fork()

    if (!body.success)
        throw createError({
            statusCode: 400,
            statusMessage: 'Bad Request: Invalid body parameters',
            message: JSON.stringify(body.error.errors)
        })

    const solution = await em.findOne(Solution, body.data.solutionId),
        primaryActor = await em.findOne(Stakeholder, body.data.primaryActorId),
        precondition = await em.findOne(Assumption, body.data.preconditionId),
        successGuarantee = await em.findOne(Effect, body.data.successGuaranteeId)

    if (!solution)
        throw createError({
            statusCode: 400,
            statusMessage: `Bad Request: No solution found with id: ${body.data.solutionId}`
        })
    if (!primaryActor)
        throw createError({
            statusCode: 400,
            statusMessage: `Bad Request: No primary actor found with id: ${body.data.primaryActorId}`
        })
    if (!precondition)
        throw createError({
            statusCode: 400,
            statusMessage: `Bad Request: No precondition found with id: ${body.data.preconditionId}`
        })
    if (!successGuarantee)
        throw createError({
            statusCode: 400,
            statusMessage: `Bad Request: No success guarantee found with id: ${body.data.successGuaranteeId}`
        })

    const newUseCase = new UseCase({
        name: body.data.name,
        statement: body.data.statement,
        solution,
        primaryActor,
        priority: body.data.priority,
        scope: body.data.scope,
        level: body.data.level,
        goalInContext: body.data.goalInContext,
        precondition,
        triggerId: body.data.triggerId,
        mainSuccessScenario: body.data.mainSuccessScenario,
        successGuarantee,
        extensions: body.data.extensions
    })

    await em.persistAndFlush(newUseCase)

    return newUseCase.id
})