import { z } from "zod"
import { fork } from "~/server/data/orm"
import { Assumption, Effect, MoscowPriority, Stakeholder, UseCase } from "~/server/domain/requirements/index.js"

const paramSchema = z.object({
    id: z.string().uuid()
})

const bodySchema = z.object({
    solutionId: z.string().uuid(),
    name: z.string().default("{Untitled Use Case}"),
    statement: z.string().default(""),
    primaryActorId: z.string().uuid().optional(),
    priority: z.nativeEnum(MoscowPriority).optional(),
    scope: z.string().default(""),
    level: z.string().default(""),
    goalInContext: z.string().default(""),
    preconditionId: z.string().uuid().optional(),
    triggerId: z.string().uuid().optional(),
    mainSuccessScenario: z.string().default(""),
    successGuaranteeId: z.string().uuid().optional(),
    extensions: z.string().default("")
})

/**
 * Updates a UseCase by id
 */
export default defineEventHandler(async (event) => {
    const { id } = await validateEventParams(event, paramSchema),
        body = await validateEventBody(event, bodySchema),
        { sessionUser } = await assertSolutionContributor(event, body.solutionId),
        em = fork()

    const useCase = await em.findOne(UseCase, id),
        primaryActor = body.primaryActorId ? await em.findOne(Stakeholder, body.primaryActorId) : undefined,
        precondition = body.preconditionId ? await em.findOne(Assumption, body.preconditionId) : undefined,
        successGuarantee = body.successGuaranteeId ? await em.findOne(Effect, body.successGuaranteeId) : undefined

    if (!useCase)
        throw createError({
            statusCode: 400,
            statusMessage: `Bad Request: No use case found with id: ${id}`
        })

    useCase.name = body.name
    useCase.statement = body.statement
    useCase.primaryActor = primaryActor ?? undefined
    useCase.priority = body.priority
    useCase.scope = body.scope
    useCase.level = body.level
    useCase.goalInContext = body.goalInContext
    useCase.precondition = precondition ?? undefined
    useCase.triggerId = body.triggerId
    useCase.mainSuccessScenario = body.mainSuccessScenario
    useCase.successGuarantee = successGuarantee ?? undefined
    useCase.extensions = body.extensions
    useCase.modifiedBy = sessionUser

    await em.flush()
})