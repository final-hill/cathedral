import { NIL as emptyUuid } from "uuid"
import { z } from "zod"
import { MoscowPriority, Stakeholder, Assumption, Effect, UseCase } from "~/server/domain/requirements/index.js"
import { fork } from "~/server/data/orm"

const bodySchema = z.object({
    solutionId: z.string().uuid(),
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
    const body = await validateEventBody(event, bodySchema),
        { solution, sessionUser } = await assertSolutionContributor(event, body.solutionId),
        em = fork()

    const primaryActor = body.primaryActorId ? await em.findOne(Stakeholder, body.primaryActorId) : undefined,
        precondition = body.preconditionId ? await em.findOne(Assumption, body.preconditionId) : undefined,
        successGuarantee = body.successGuaranteeId ? await em.findOne(Effect, body.successGuaranteeId) : undefined

    const newUseCase = new UseCase({
        name: body.name,
        statement: body.statement,
        solution,
        primaryActor: primaryActor ?? undefined,
        priority: body.priority,
        scope: body.scope,
        level: body.level,
        goalInContext: body.goalInContext,
        precondition: precondition ?? undefined,
        triggerId: body.triggerId,
        mainSuccessScenario: body.mainSuccessScenario,
        successGuarantee: successGuarantee ?? undefined,
        extensions: body.extensions,
        lastModified: new Date(),
        modifiedBy: sessionUser
    })

    await em.persistAndFlush(newUseCase)

    return newUseCase.id
})