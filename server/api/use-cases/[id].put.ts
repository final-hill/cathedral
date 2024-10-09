import { z } from "zod"
import { fork } from "~/server/data/orm.js"
import { Assumption, Effect, MoscowPriority, Stakeholder, UseCase } from "~/server/domain/index.js"

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
    extensions: z.string().default(""),
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
        name: body.name,
        statement: body.statement,
        priority: body.priority,
        scope: body.scope,
        level: body.level,
        goalInContext: body.goalInContext,
        triggerId: body.triggerId,
        mainSuccessScenario: body.mainSuccessScenario,
        extensions: body.extensions,
        modifiedBy: sessionUser,
        lastModified: new Date(),
        ...(body.isSilence !== undefined && { isSilence: body.isSilence })
    })

    await em.persistAndFlush(useCase)
})