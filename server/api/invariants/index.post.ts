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
 * POST /api/invariants
 *
 * Creates a new invariant and returns its id
 */
export default defineEventHandler(async (event) => {
    const invariantInteractor = new InvariantInteractor(new InvariantRepository()),
        body = await readValidatedBody(event, (b) => bodySchema.safeParse(b))

    if (!body.success)
        throw createError({
            statusCode: 400,
            statusMessage: "Bad Request: Invalid body parameters"
        })

    return invariantInteractor.create({
        name: body.data.name,
        statement: body.data.statement,
        solutionId: body.data.solutionId as Uuid
    })
})