import { z } from "zod"
import orm from "~/server/data/orm"
import Solution from "~/server/domain/Solution"

const bodySchema = z.object({
    name: z.string().min(1).max(Solution.maxNameLength),
    description: z.string()
})

/**
 * POST /api/solutions
 *
 * Creates a new solution and returns its id
 */
export default defineEventHandler(async (event) => {
    const body = await readValidatedBody(event, (b) => bodySchema.safeParse(b))

    if (!body.success)
        throw createError({
            statusCode: 400,
            statusMessage: "Bad Request: Invalid body parameters"
        })

    const newSolution = new Solution({
        description: body.data.description,
        name: body.data.name
    })

    await orm.em.persistAndFlush(newSolution)
})