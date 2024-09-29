import { z } from "zod"
import { fork } from "~/server/data/orm"
import { Constraint, ConstraintCategory } from "~/server/domain/requirements/index.js"

const bodySchema = z.object({
    solutionId: z.string().uuid(),
    name: z.string().default("{Untitled Constraint}"),
    statement: z.string().default(""),
    category: z.nativeEnum(ConstraintCategory).optional()
})

/**
 * Creates a new constraint and returns its id
 */
export default defineEventHandler(async (event) => {
    const { category, name, statement, solutionId } = await validateEventBody(event, bodySchema),
        { solution, sessionUser } = await assertSolutionContributor(event, solutionId),
        em = fork()

    const newConstraint = new Constraint({
        name,
        statement,
        solution,
        category,
        lastModified: new Date(),
        modifiedBy: sessionUser
    })

    await em.persistAndFlush(newConstraint)

    return newConstraint.id
})