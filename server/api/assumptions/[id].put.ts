import AssumptionInteractor from "~/server/application/AssumptionInteractor"
import AssumptionRepository from "~/server/data/repositories/AssumptionRepository"
import { type Uuid } from "~/server/domain/Uuid"
import { z } from "zod"

const bodySchema = z.object({
    name: z.string().min(1),
    statement: z.string().min(1),
    solutionId: z.string().uuid()
})

/**
 * PUT /api/assumptions/:id
 *   body: {
 *     name: string,
 *     statement: string
 *     solutionId: Uuid
 *   }
 *
 * Updates an assumption by id.
 */
export default defineEventHandler(async (event) => {
    const id = event.context.params?.id,
        assumptionInteractor = new AssumptionInteractor(new AssumptionRepository()),
        body = await readValidatedBody(event, (b) => bodySchema.safeParse(b))

    if (!body.success)
        throw createError({
            statusCode: 400,
            statusMessage: "Bad Request: Invalid body parameters"
        })

    if (id) {
        return assumptionInteractor.update({
            id: id as Uuid,
            name: body.data.name,
            statement: body.data.statement,
            solutionId: body.data.solutionId as Uuid
        })
    } else {
        throw createError({
            statusCode: 400,
            statusMessage: "Bad Request: id is required."
        })
    }
})