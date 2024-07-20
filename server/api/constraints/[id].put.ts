import { z } from "zod"
import Constraint, { ConstraintCategory } from "~/server/domain/Constraint"
import orm from "~/server/data/orm"
import Solution from "~/server/domain/Solution"

const bodySchema = z.object({
    name: z.string().min(1),
    statement: z.string().min(1),
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
        body = await readValidatedBody(event, (b) => bodySchema.safeParse(b))

    if (!body.success)
        throw createError({
            statusCode: 400,
            statusMessage: "Bad Request: Invalid body parameters"
        })

    if (id) {
        const constraint = await orm.em.findOne(Constraint, id),
            solution = await orm.em.findOne(Solution, body.data.solutionId)

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
    } else {
        throw createError({
            statusCode: 400,
            statusMessage: "Bad Request: id is required."
        })
    }
})