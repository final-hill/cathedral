import { type Uuid } from "~/server/domain/Uuid"
import { z } from "zod"
import FunctionalBehaviorInteractor from "~/server/application/FunctionalBehaviorInteractor"
import FunctionalBehaviorRepository from "~/server/data/repositories/FunctionalBehaviorRepository"

const bodySchema = z.object({
    name: z.string().min(1),
    statement: z.string().min(1),
    solutionId: z.string().uuid(),
    priorityId: z.enum(['MUST', 'SHOULD', 'COULD', 'WONT'])
})

/**
 * Creates a new functional behavior and returns its id
 */
export default defineEventHandler(async (event) => {
    const functionalBehaviorInteractor = new FunctionalBehaviorInteractor(new FunctionalBehaviorRepository()),
        body = await readValidatedBody(event, (b) => bodySchema.safeParse(b))

    if (!body.success)
        throw createError({
            statusCode: 400,
            statusMessage: "Bad Request: Invalid body parameters"
        })

    return functionalBehaviorInteractor.create({
        name: body.data.name,
        statement: body.data.statement,
        solutionId: body.data.solutionId as Uuid,
        priorityId: body.data.priorityId
    })
})