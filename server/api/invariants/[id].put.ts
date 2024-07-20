import { z } from "zod"
import orm from "~/server/data/orm"
import Invariant from "~/server/domain/Invariant"
import Solution from "~/server/domain/Solution"

const bodySchema = z.object({
    name: z.string().min(1),
    statement: z.string().min(0),
    solutionId: z.string().uuid()
})

/**
 * PUT /api/invariants/:id
 * Updates an invariant by id.
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
        const invariant = await orm.em.findOne(Invariant, id),
            solution = await orm.em.findOne(Solution, body.data.solutionId)

        if (!invariant)
            throw createError({
                statusCode: 400,
                statusMessage: `Bad Request: No effect found with id: ${id}`
            })
        if (!solution)
            throw createError({
                statusCode: 400,
                statusMessage: `Bad Request: No solution found with id: ${body.data.solutionId}`
            })

        invariant.name = body.data.name
        invariant.statement = body.data.statement
        invariant.solution = solution

        await orm.em.flush()
    } else {
        throw createError({
            statusCode: 400,
            statusMessage: "Bad Request: id is required."
        })
    }
})