import { type Uuid } from "~/server/domain/Uuid"
import { z } from "zod"
import NonFunctionalBehaviorInteractor from "~/server/application/NonFunctionalBehaviorInteractor"
import NonFunctionalBehaviorRepository from "~/server/data/repositories/NonFunctionalBehaviorRepository"

const bodySchema = z.object({
    name: z.string().min(1),
    statement: z.string().min(1),
    solutionId: z.string().uuid(),
    priorityId: z.enum(['MUST', 'SHOULD', 'COULD', 'WONT'])
})

/**
 * Creates a new non functional behavior and returns its id
 */
export default defineEventHandler(async (event) => {
    const nonFunctionalBehaviorInteractor = new NonFunctionalBehaviorInteractor(new NonFunctionalBehaviorRepository()),
        body = await readValidatedBody(event, (b) => bodySchema.safeParse(b))

    if (!body.success)
        throw createError({
            statusCode: 400,
            statusMessage: "Bad Request: Invalid body parameters"
        })

    return nonFunctionalBehaviorInteractor.create({
        name: body.data.name,
        statement: body.data.statement,
        solutionId: body.data.solutionId as Uuid,
        priorityId: body.data.priorityId
    })
})