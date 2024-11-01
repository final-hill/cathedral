import { z } from "zod"
import { fork } from "~/server/data/orm.js"
import { Constraint, ConstraintCategory } from "~/domain/requirements/index.js"
import { Belongs } from "~/domain/relations"

const bodySchema = z.object({
    solutionId: z.string().uuid(),
    name: z.string().default("{Untitled Constraint}"),
    description: z.string().default(""),
    category: z.nativeEnum(ConstraintCategory).optional(),
    isSilence: z.boolean().default(false)
})

/**
 * Creates a new constraint and returns its id
 */
export default defineEventHandler(async (event) => {
    const { category, name, description, solutionId, isSilence } = await validateEventBody(event, bodySchema),
        { solution, sessionUser } = await assertSolutionContributor(event, solutionId),
        em = fork()

    const newId = await em.transactional(async (em) => {
        const newConstraint = em.create(Constraint, {
            reqId: await getNextReqId('E.3.', em, solution) as Constraint['reqId'],
            name,
            description,
            category,
            lastModified: new Date(),
            modifiedBy: sessionUser,
            isSilence
        })

        em.create(Belongs, {
            left: newConstraint,
            right: solution
        })

        await em.flush()

        return newConstraint.id
    })

    return newId
})