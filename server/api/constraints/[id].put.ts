import { z } from "zod"
import { Constraint, ConstraintCategory } from "~/server/domain/requirements/index.js"
import { fork } from "~/server/data/orm.js"

const paramSchema = z.object({
    id: z.string().uuid()
})

const bodySchema = z.object({
    solutionId: z.string().uuid(),
    name: z.string().optional(),
    description: z.string().optional(),
    category: z.nativeEnum(ConstraintCategory).optional(),
    isSilence: z.boolean().optional()
})

/**
 * Updates a constraint by id.
 */
export default defineEventHandler(async (event) => {
    const { id } = await validateEventParams(event, paramSchema),
        { category, name, description, solutionId, isSilence } = await validateEventBody(event, bodySchema),
        { sessionUser, solution } = await assertSolutionContributor(event, solutionId),
        em = fork(),
        constraint = await assertReqBelongsToSolution(em, Constraint, id, solution)

    constraint.assign({
        name: name ?? constraint.name,
        description: description ?? constraint.description,
        category: category ?? constraint.category,
        isSilence: isSilence ?? constraint.isSilence,
        modifiedBy: sessionUser,
        lastModified: new Date()
    })

    await em.flush()
})