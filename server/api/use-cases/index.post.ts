import { type Uuid } from "~/server/domain/Uuid"
import { z } from "zod"
import UseCaseInteractor from "~/server/application/UseCaseInteractor"
import UseCaseRepository from "~/server/data/repositories/UseCaseRepository"

const bodySchema = z.object({
    name: z.string(),
    statement: z.string().min(0),
    solutionId: z.string().uuid(),
    primaryActorId: z.string().uuid(),
    priorityId: z.enum(["MUST", "SHOULD", "COULD", "WONT"]),
    scope: z.string(),
    level: z.string(),
    goalInContext: z.string(),
    preconditionId: z.string().uuid(),
    triggerId: z.string().uuid(),
    mainSuccessScenario: z.string(),
    successGuaranteeId: z.string().uuid(),
    extensions: z.string()
})

/**
 * Creates a new use case and returns its id
 */
export default defineEventHandler(async (event) => {
    const useCaseInteractor = new UseCaseInteractor(new UseCaseRepository()),
        body = await readValidatedBody(event, (b) => bodySchema.safeParse(b))

    if (!body.success)
        throw createError({
            statusCode: 400,
            statusMessage: "Bad Request: Invalid body parameters"
        })

    return useCaseInteractor.create({
        name: body.data.name,
        statement: body.data.statement,
        solutionId: body.data.solutionId as Uuid,
        primaryActorId: body.data.primaryActorId as Uuid,
        priorityId: body.data.priorityId,
        scope: body.data.scope,
        level: body.data.level,
        goalInContext: body.data.goalInContext,
        preconditionId: body.data.preconditionId as Uuid,
        triggerId: body.data.triggerId as Uuid,
        mainSuccessScenario: body.data.mainSuccessScenario,
        extensions: body.data.extensions,
        successGuaranteeId: body.data.successGuaranteeId as Uuid,
    })
})