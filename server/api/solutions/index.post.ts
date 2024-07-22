import { z } from "zod"
import { fork } from "~/server/data/orm"
import Solution from "~/server/domain/Solution"

const bodySchema = z.object({
    name: z.string().min(1).max(100),
    description: z.string()
})

/**
 * POST /api/solutions
 *
 * Creates a new solution and returns its id
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

    const newSolution = new Solution({
        description: body.data.description,
        name: body.data.name
    })

    await em.persistAndFlush(newSolution)

    return newSolution.id
})