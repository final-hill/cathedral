import { type Uuid } from "~/server/domain/Uuid"
import { z } from "zod"
import OutcomeRepository from "~/server/data/repositories/OutcomeRepository"
import OutcomeInteractor from "~/server/application/OutcomeInteractor"

const bodySchema = z.object({
    name: z.string().min(1),
    statement: z.string().min(1),
    solutionId: z.string().uuid()
})

/**
 * POST /api/obstacles
 *   body: {
 *     name: string,
 *     statement: string,
 *     solutionId: Uuid
 *   }
 *
 * Creates a new obstacle and returns its id
 */
export default defineEventHandler(async (event) => {
    const outcomeInteractor = new OutcomeInteractor(new OutcomeRepository()),
        body = await readValidatedBody(event, (b) => bodySchema.safeParse(b))

    if (!body.success)
        throw createError({
            statusCode: 400,
            statusMessage: "Bad Request: Invalid body parameters"
        })

    return outcomeInteractor.create({
        name: body.data.name,
        statement: body.data.statement,
        solutionId: body.data.solutionId as Uuid
    })
})