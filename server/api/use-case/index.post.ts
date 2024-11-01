import { NIL as emptyUuid } from "uuid"
import { z } from "zod"
import { MoscowPriority, Stakeholder, Assumption, Effect, UseCase, Outcome } from "~/domain/requirements/index.js"
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
    outcome: z.string().uuid(),
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

    const newId = await em.transactional(async (em) => {
        const newUseCase = new UseCase({
            reqId: await getNextReqId('S.4.', em, solution) as UseCase['reqId'],
            name: body.name,
            description: body.description,
            primaryActor: body.primaryActor ? em.getReference(Stakeholder, body.primaryActor) : undefined,
            priority: body.priority,
            scope: body.scope,
            level: body.level,
            outcome: body.outcome ? em.getReference(Outcome, body.outcome) : undefined,
            precondition: body.precondition ? em.getReference(Assumption, body.precondition) : undefined,
            triggerId: body.triggerId,
            mainSuccessScenario: body.mainSuccessScenario,
            successGuarantee: body.successGuarantee ? em.getReference(Effect, body.successGuarantee) : undefined,
            extensions: body.extensions,
            lastModified: new Date(),
            modifiedBy: sessionUser,
            isSilence: body.isSilence
        })

        em.create(Belongs, {
            left: newUseCase,
            right: solution
        })

        await em.flush()

        return newUseCase.id
    })

    return newId
})