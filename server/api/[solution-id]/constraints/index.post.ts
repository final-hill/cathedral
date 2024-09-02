import { z } from "zod"
import { fork } from "~/server/data/orm"
import { Constraint, ConstraintCategory } from "~/server/domain/requirements/index.js"

const paramSchema = z.object({
    solutionId: z.string().uuid()
})

const bodySchema = z.object({
    name: z.string().min(1),
    statement: z.string(),
    category: z.nativeEnum(ConstraintCategory)
})

/**
 * POST /api/constraints
 *
 * Creates a new constraint and returns its id
 */
export default defineEventHandler(async (event) => {
    const { solutionId } = await validateEventParams(event, paramSchema),
        body = await validateEventBody(event, bodySchema),
        { solution, sessionUser } = await assertSolutionContributor(event, solutionId),
        em = fork()

    const newConstraint = new Constraint({
        name: body.name,
        statement: body.statement,
        solution,
        category: body.category,
        lastModified: new Date(),
        modifiedBy: sessionUser
    })

    await em.persistAndFlush(newConstraint)

    return newConstraint.id
})