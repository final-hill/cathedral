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
 * Updates a functional behavior by id.
 */
export default defineEventHandler(async (event) => {
    const id = event.context.params?.id,
        functionalBehaviorInteractor = new FunctionalBehaviorInteractor(new FunctionalBehaviorRepository()),
        body = await readValidatedBody(event, (b) => bodySchema.safeParse(b))

    if (!body.success)
        throw createError({
            statusCode: 400,
            statusMessage: "Bad Request: Invalid body parameters"
        })

    if (id) {
        return functionalBehaviorInteractor.update({
            id: id as Uuid,
            name: body.data.name,
            statement: body.data.statement,
            solutionId: body.data.solutionId as Uuid,
            priorityId: body.data.priorityId
        })
    } else {
        throw createError({
            statusCode: 400,
            statusMessage: "Bad Request: id is required."
        })
    }
})