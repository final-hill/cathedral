import { z } from "zod"
import { Constraint, ConstraintCategory } from "~/server/domain/index.js"
import { fork } from "~/server/data/orm.js"

const paramSchema = z.object({
    id: z.string().uuid()
})

const bodySchema = z.object({
    solutionId: z.string().uuid(),
    name: z.string().optional(),
    statement: z.string().optional(),
    category: z.nativeEnum(ConstraintCategory).optional(),
    isSilence: z.boolean().optional()
})

/**
 * Updates a constraint by id.
 */
export default defineEventHandler(async (event) => {
    const { id } = await validateEventParams(event, paramSchema),
        { category, name, statement, solutionId, isSilence } = await validateEventBody(event, bodySchema),
        { sessionUser } = await assertSolutionContributor(event, solutionId),
        em = fork(),
        constraint = await em.findOne(Constraint, id)

    if (!constraint)
        throw createError({
            statusCode: 400,
            statusMessage: `Bad Request: No constraint found with id: ${id}`
        })

    Object.assign(constraint, {
        name: name ?? constraint.name,
        statement: statement ?? constraint.statement,
        category: category ?? constraint.category,
        isSilence: isSilence ?? constraint.isSilence,
        modifiedBy: sessionUser,
        lastModified: new Date()
    })

    await em.persistAndFlush(constraint)
})