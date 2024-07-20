import { z } from "zod"
import orm from "~/server/data/orm"
import Assumption from "~/server/domain/Assumption"
import Effect from "~/server/domain/Effect"
import MoscowPriority from "~/server/domain/MoscowPriority"
import Solution from "~/server/domain/Solution"
import Stakeholder from "~/server/domain/Stakeholder"
import UseCase from "~/server/domain/UseCase"
import { emptyUuid } from "~/server/domain/Uuid"

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
 * Updates a UseCase by id
 */
export default defineEventHandler(async (event) => {
    const id = event.context.params?.id,
        body = await readValidatedBody(event, (b) => bodySchema.safeParse(b))

    if (!body.success)
        throw createError({
            statusCode: 400,
            statusMessage: "Bad Request: Invalid body parameters"
        })

    if (id) {
        const useCase = await orm.em.findOne(UseCase, id),
            solution = await orm.em.findOne(Solution, body.data.solutionId),
            primaryActor = await orm.em.findOne(Stakeholder, body.data.primaryActorId),
            precondition = await orm.em.findOne(Assumption, body.data.preconditionId),
            successGuarantee = await orm.em.findOne(Effect, body.data.successGuaranteeId)

        if (!useCase)
            throw createError({
                statusCode: 400,
                statusMessage: `Bad Request: No use case found with id: ${id}`
            })
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

        useCase.name = body.data.name
        useCase.statement = body.data.statement
        useCase.solution = solution
        useCase.primaryActor = primaryActor
        useCase.priority = body.data.priority
        useCase.scope = body.data.scope
        useCase.level = body.data.level
        useCase.goalInContext = body.data.goalInContext
        useCase.precondition = precondition
        useCase.triggerId = body.data.triggerId
        useCase.mainSuccessScenario = body.data.mainSuccessScenario
        useCase.successGuarantee = successGuarantee
        useCase.extensions = body.data.extensions

        await orm.em.flush()
    } else {
        throw createError({
            statusCode: 400,
            statusMessage: "Bad Request: id is required."
        })
    }
})