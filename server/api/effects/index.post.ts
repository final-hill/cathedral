import { type Uuid } from "~/server/domain/Uuid"
import { z } from "zod"
import EffectInteractor from "~/server/application/EffectInteractor"
import EffectRepository from "~/server/data/repositories/EffectRepository"

const bodySchema = z.object({
    name: z.string().min(1),
    statement: z.string().min(1),
    solutionId: z.string().uuid()
})

/**
 * POST /api/effects
 *   body: {
 *     name: string,
 *     statement: string,
 *     solutionId: Uuid
 *   }
 *
 * Creates a new effect and returns its id
 */
export default defineEventHandler(async (event) => {
    const effectInteractor = new EffectInteractor(new EffectRepository()),
        body = await readValidatedBody(event, (b) => bodySchema.safeParse(b))

    if (!body.success)
        throw createError({
            statusCode: 400,
            statusMessage: "Bad Request: Invalid body parameters"
        })

    return effectInteractor.create({
        name: body.data.name,
        statement: body.data.statement,
        solutionId: body.data.solutionId as Uuid
    })
})