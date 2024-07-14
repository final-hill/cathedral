import { type Uuid } from "~/server/domain/Uuid"
import { z } from "zod"
import InvariantRepository from "~/server/data/repositories/InvariantRepository"
import InvariantInteractor from "~/server/application/InvariantInteractor"

const bodySchema = z.object({
    name: z.string().min(1),
    statement: z.string().min(0),
    solutionId: z.string().uuid()
})

/**
 * PUT /api/invariants/:id
 * Updates an invariant by id.
 */
export default defineEventHandler(async (event) => {
    const id = event.context.params?.id,
        invariantInteractor = new InvariantInteractor(new InvariantRepository()),
        body = await readValidatedBody(event, (b) => bodySchema.safeParse(b))

    if (!body.success)
        throw createError({
            statusCode: 400,
            statusMessage: "Bad Request: Invalid body parameters"
        })

    if (id) {
        return invariantInteractor.update({
            id: id as Uuid,
            name: body.data.name,
            statement: body.data.statement,
            solutionId: body.data.solutionId as Uuid,
        })
    } else {
        throw createError({
            statusCode: 400,
            statusMessage: "Bad Request: id is required."
        })
    }
})