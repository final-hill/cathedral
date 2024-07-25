import { fork } from "~/server/data/orm"
import { z } from "zod"
import Effect from "~/server/domain/requirements/Effect"
import Solution from "~/server/domain/application/Solution"

const bodySchema = z.object({
    name: z.string().min(1),
    statement: z.string(),
    solutionId: z.string().uuid()
})

/**
 * POST /api/effects
 *
 * Creates a new effect and returns its id
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

    const solution = await em.findOne(Solution, body.data.solutionId)

    if (!solution)
        throw createError({
            statusCode: 400,
            statusMessage: `Bad Request: Solution not found for id ${body.data.solutionId}`
        })

    const newEffect = new Effect({
        name: body.data.name,
        statement: body.data.statement,
        solution
    })

    await em.persistAndFlush(newEffect)

    return newEffect.id
})