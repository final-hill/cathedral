import { fork } from "~/server/data/orm"
import { z } from "zod"
import Solution from "~/server/domain/Solution"
import Justification from "~/server/domain/Justification"
import { type Uuid } from "~/server/domain/Uuid"

const bodySchema = z.object({
    name: z.string().min(1),
    statement: z.string(),
    solutionId: z.string().uuid()
})

/**
 * POST /api/justifications
 *
 * Creates a new justifications and returns its id
 */
export default defineEventHandler(async (event) => {
    const body = await readValidatedBody(event, (b) => bodySchema.safeParse(b)),
        em = fork()

    if (!body.success)
        throw createError({
            statusCode: 400,
            statusMessage: 'Bad Request: Invalid body parameters',
            message: JSON.stringify(body.error.errors)
        })

    const solution = await em.findOne(Solution, body.data.solutionId as Uuid)

    if (!solution)
        throw createError({
            statusCode: 400,
            statusMessage: `Bad Request: Solution not found for id ${body.data.solutionId}`
        })

    const newJustification = new Justification({
        name: body.data.name,
        statement: body.data.statement,
        solution
    })

    await em.persistAndFlush(newJustification)

    return newJustification.id
})