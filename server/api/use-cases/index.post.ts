import { emptyUuid, type Uuid } from "~/server/domain/Uuid"
import { z } from "zod"
import MoscowPriority from "~/server/domain/MoscowPriority"
import orm from "~/server/data/orm"
import Solution from "~/server/domain/Solution"
import Stakeholder from "~/server/domain/Stakeholder"
import Assumption from "~/server/domain/Assumption"
import Effect from "~/server/domain/Effect"
import UseCase from "~/server/domain/UseCase"

const bodySchema = z.object({
    name: z.string(),
    statement: z.string().min(0),
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
    const body = await readValidatedBody(event, (b) => bodySchema.safeParse(b))

    if (!body.success)
        throw createError({
            statusCode: 400,
            statusMessage: "Bad Request: Invalid body parameters"
        })

    const solution = await orm.em.findOne(Solution, body.data.solutionId),
        primaryActor = await orm.em.findOne(Stakeholder, body.data.primaryActorId),
        precondition = await orm.em.findOne(Assumption, body.data.preconditionId),
        successGuarantee = await orm.em.findOne(Effect, body.data.successGuaranteeId)

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

    await orm.em.persistAndFlush(newUseCase)
})