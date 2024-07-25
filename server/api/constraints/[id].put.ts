import { z } from "zod"
import Constraint from "~/server/domain/requirements/Constraint"
import ConstraintCategory from "~/server/domain/requirements/ConstraintCategory"
import { fork } from "~/server/data/orm"
import Solution from "~/server/domain/application/Solution"

const bodySchema = z.object({
    name: z.string().min(1),
    statement: z.string(),
    solutionId: z.string().uuid(),
    category: z.nativeEnum(ConstraintCategory)
})

/**
 * PUT /api/constraints/:id
 *
 * Updates a constraint by id.
 */
export default defineEventHandler(async (event) => {
    const id = event.context.params?.id,
        body = await readValidatedBody(event, (b) => bodySchema.safeParse(b)),
        em = fork()

    if (!body.success)
        throw createError({
            statusCode: 400,
            statusMessage: 'Bad Request: Invalid body parameters',
            message: JSON.stringify(body.error.errors)
        })

    if (id) {
        const constraint = await em.findOne(Constraint, id),
            solution = await em.findOne(Solution, body.data.solutionId)

        if (!constraint)
            throw createError({
                statusCode: 400,
                statusMessage: `Bad Request: No constraint found with id: ${id}`
            })
        if (!solution)
            throw createError({
                statusCode: 400,
                statusMessage: `Bad Request: No solution found with id: ${body.data.solutionId}`
            })

        constraint.name = body.data.name
        constraint.statement = body.data.statement
        constraint.solution = solution
        constraint.category = body.data.category

        await em.flush()
    } else {
        throw createError({
            statusCode: 400,
            statusMessage: "Bad Request: id is required."
        })
    }
})