import { z } from "zod"
import { fork } from "~/server/data/orm.js"
import { Constraint, ConstraintCategory } from "~/server/domain/index.js"

const bodySchema = z.object({
    solutionId: z.string().uuid(),
    name: z.string().default("{Untitled Constraint}"),
    statement: z.string().default(""),
    category: z.nativeEnum(ConstraintCategory).optional(),
    isSilence: z.boolean().default(false)
})

/**
 * Creates a new constraint and returns its id
 */
export default defineEventHandler(async (event) => {
    const { category, name, statement, solutionId, isSilence } = await validateEventBody(event, bodySchema),
        { solution, sessionUser } = await assertSolutionContributor(event, solutionId),
        em = fork()

    const newConstraint = new Constraint({
        name,
        statement,
        solution,
        category,
        lastModified: new Date(),
        modifiedBy: sessionUser,
        isSilence
    })

    await em.persistAndFlush(newConstraint)

    return newConstraint.id
})