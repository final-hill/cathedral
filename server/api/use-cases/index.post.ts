import { NIL as emptyUuid } from "uuid"
import { z } from "zod"
import { MoscowPriority, Stakeholder, Assumption, Effect, UseCase } from "~/server/domain/requirements/index.js"
import { fork } from "~/server/data/orm.js"
import { Belongs } from "~/server/domain/relations"

const bodySchema = z.object({
    solutionId: z.string().uuid(),
    name: z.string(),
    description: z.string(),
    primaryActorId: z.string().uuid(),
    priority: z.nativeEnum(MoscowPriority),
    scope: z.string(),
    level: z.string(),
    goalInContext: z.string(),
    preconditionId: z.string().uuid(),
    triggerId: z.literal(emptyUuid),
    mainSuccessScenario: z.string(),
    successGuaranteeId: z.string().uuid(),
    extensions: z.string(),
    isSilence: z.boolean().default(false)
})

/**
 * Creates a new use case and returns its id
 */
export default defineEventHandler(async (event) => {
    const body = await validateEventBody(event, bodySchema),
        { solution, sessionUser } = await assertSolutionContributor(event, body.solutionId),
        em = fork()

    const newUseCase = new UseCase({
        name: body.name,
        description: body.description,
        primaryActor: body.primaryActorId ? em.getReference(Stakeholder, body.primaryActorId) : undefined,
        priority: body.priority,
        scope: body.scope,
        level: body.level,
        goalInContext: body.goalInContext,
        precondition: body.preconditionId ? em.getReference(Assumption, body.preconditionId) : undefined,
        triggerId: body.triggerId,
        mainSuccessScenario: body.mainSuccessScenario,
        successGuarantee: body.successGuaranteeId ? em.getReference(Effect, body.successGuaranteeId) : undefined,
        extensions: body.extensions,
        lastModified: new Date(),
        modifiedBy: sessionUser,
        isSilence: body.isSilence
    })

    em.create(Belongs, { left: newUseCase, right: solution })

    await em.flush()

    return newUseCase.id
})