import { type Uuid } from "~/server/domain/Uuid"
import { z } from "zod"
import LimitInteractor from "~/server/application/LimitInteractor"
import LimitRepository from "~/server/data/repositories/LimitRepository"


const bodySchema = z.object({
    name: z.string(),
    statement: z.string(),
    solutionId: z.string()
})

/**
 * PUT /api/limits/:id
 *   body: {
 *     name: string,
 *     statement: string
 *     solutionId: Uuid
 *   }
 *
 * Updates a limit by id.
 */
export default defineEventHandler(async (event) => {
    const id = event.context.params?.id,
        limitInteractor = new LimitInteractor(new LimitRepository()),
        body = await readValidatedBody(event, (b) => bodySchema.safeParse(b))

    if (!body.success)
        throw createError({
            statusCode: 400,
            statusMessage: "Bad Request: Invalid body parameters"
        })

    if (id) {
        return limitInteractor.update({
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