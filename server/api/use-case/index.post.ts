import { NIL as emptyUuid } from "uuid"
import { z } from "zod"
import { MoscowPriority, Stakeholder, Assumption, Effect, UseCase } from "~/domain/requirements/index.js"
import { fork } from "~/server/data/orm.js"
import { Belongs } from "~/domain/relations"

const bodySchema = z.object({
    solutionId: z.string().uuid(),
    name: z.string(),
    description: z.string(),
    primaryActor: z.string().uuid(),
    priority: z.nativeEnum(MoscowPriority),
    scope: z.string(),
    level: z.string(),
    goalInContext: z.string(),
    precondition: z.string().uuid(),
    triggerId: z.literal(emptyUuid),
    mainSuccessScenario: z.string(),
    successGuarantee: z.string().uuid(),
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
        primaryActor: body.primaryActor ? em.getReference(Stakeholder, body.primaryActor) : undefined,
        priority: body.priority,
        scope: body.scope,
        level: body.level,
        goalInContext: body.goalInContext,
        precondition: body.precondition ? em.getReference(Assumption, body.precondition) : undefined,
        triggerId: body.triggerId,
        mainSuccessScenario: body.mainSuccessScenario,
        successGuarantee: body.successGuarantee ? em.getReference(Effect, body.successGuarantee) : undefined,
        extensions: body.extensions,
        lastModified: new Date(),
        modifiedBy: sessionUser,
        isSilence: body.isSilence
    })

    em.create(Belongs, { left: newUseCase, right: solution })

    await em.flush()

    return newUseCase.id
})