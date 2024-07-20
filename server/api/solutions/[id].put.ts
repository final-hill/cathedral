import { z } from "zod"
import orm from "~/server/data/orm"
import Solution from "~/server/domain/Solution"

const bodySchema = z.object({
    name: z.string().min(1).max(Solution.maxNameLength),
    description: z.string()
})

/**
 * PUT /api/solutions/:id
 *
 * Updates a solution by id.
 */
export default defineEventHandler(async (event) => {
    const id = event.context.params?.id,
        body = await readValidatedBody(event, (b) => bodySchema.safeParse(b))

    if (!body.success)
        throw createError({
            statusCode: 400,
            statusMessage: "Bad Request: Invalid body parameters"
        })

    if (id) {
        const solution = await orm.em.findOne(Solution, id)

        if (!solution)
            throw createError({
                statusCode: 400,
                statusMessage: `Bad Request: No solution found with id: ${id}`
            })

        Object.assign(solution, {
            name: body.data.name,
            description: body.data.description
        })

        await orm.em.flush()
    } else {
        throw createError({
            statusCode: 400,
            statusMessage: "Bad Request: id is required."
        })
    }
})