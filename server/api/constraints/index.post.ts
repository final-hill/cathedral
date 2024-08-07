import { z } from "zod"
import { fork } from "~/server/data/orm"
import Constraint from "~/server/domain/requirements/Constraint"
import Solution from "~/server/domain/application/Solution"
import ConstraintCategory from "~/server/domain/requirements/ConstraintCategory"

const bodySchema = z.object({
    name: z.string().min(1),
    statement: z.string(),
    solutionId: z.string().uuid(),
    category: z.nativeEnum(ConstraintCategory)
})

/**
 * POST /api/constraints
 *
 * Creates a new constraint and returns its id
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

    const newConstraint = new Constraint({
        name: body.data.name,
        statement: body.data.statement,
        solution,
        category: body.data.category
    })

    await em.persistAndFlush(newConstraint)

    return newConstraint.id
})