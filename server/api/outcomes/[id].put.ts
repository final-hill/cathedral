import { type Uuid } from "~/server/domain/Uuid"
import { z } from "zod"
import orm from "~/server/data/orm"
import Outcome from "~/server/domain/Outcome"
import Solution from "~/server/domain/Solution"

const bodySchema = z.object({
    name: z.string(),
    statement: z.string(),
    solutionId: z.string()
})

/**
 * Updates an outcome by id.
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
        const outcome = await orm.em.findOne(Outcome, id),
            solution = await orm.em.findOne(Solution, body.data.solutionId)

        if (!outcome)
            throw createError({
                statusCode: 400,
                statusMessage: `Bad Request: No assumption found with id: ${id}`
            })
        if (!solution)
            throw createError({
                statusCode: 400,
                statusMessage: `Bad Request: No solution found with id: ${body.data.solutionId}`
            })

        outcome.name = body.data.name
        outcome.statement = body.data.statement
        outcome.solution = solution

        await orm.em.flush()
    } else {
        throw createError({
            statusCode: 400,
            statusMessage: "Bad Request: id is required."
        })
    }
})