import { type Uuid } from "~/server/domain/Uuid"
import { z } from "zod"
import LimitInteractor from "~/server/application/LimitInteractor"
import LimitRepository from "~/server/data/repositories/LimitRepository"

const bodySchema = z.object({
    name: z.string().min(1),
    statement: z.string().min(1),
    solutionId: z.string().uuid()
})

/**
 * POST /api/limits
 *   body: {
 *     name: string,
 *     statement: string,
 *     solutionId: Uuid
 *   }
 *
 * Creates a new limit and returns its id
 */
export default defineEventHandler(async (event) => {
    const limitInteractor = new LimitInteractor(new LimitRepository()),
        body = await readValidatedBody(event, (b) => bodySchema.safeParse(b))

    if (!body.success)
        throw createError({
            statusCode: 400,
            statusMessage: "Bad Request: Invalid body parameters"
        })

    return limitInteractor.create({
        name: body.data.name,
        statement: body.data.statement,
        solutionId: body.data.solutionId as Uuid
    })
})