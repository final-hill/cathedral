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
 * POST /api/assumptions
 *   body: {
 *     name: string,
 *     statement: string,
 *     solutionId: Uuid
 *   }
 *
 * Creates a new assumption and returns its id
 */
export default defineEventHandler(async (event) => {
    const assumptionInteractor = new AssumptionInteractor(new AssumptionRepository()),
        body = await readValidatedBody(event, (b) => bodySchema.safeParse(b))

    if (!body.success)
        throw createError({
            statusCode: 400,
            statusMessage: "Bad Request: Invalid body parameters"
        })

    return assumptionInteractor.create({
        name: body.data.name,
        statement: body.data.statement,
        solutionId: body.data.solutionId as Uuid
    })
})