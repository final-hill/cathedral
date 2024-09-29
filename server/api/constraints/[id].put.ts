import { z } from "zod"
import { Constraint, ConstraintCategory } from "~/server/domain/requirements/index.js"
import { fork } from "~/server/data/orm"

const paramSchema = z.object({
    id: z.string().uuid()
})

const bodySchema = z.object({
    solutionId: z.string().uuid(),
    name: z.string().default("{Untitled Constraint}"),
    statement: z.string().default(""),
    category: z.nativeEnum(ConstraintCategory).optional()
})

/**
 * Updates a constraint by id.
 */
export default defineEventHandler(async (event) => {
    const { id } = await validateEventParams(event, paramSchema),
        { category, name, statement, solutionId } = await validateEventBody(event, bodySchema),
        { sessionUser } = await assertSolutionContributor(event, solutionId),
        em = fork()

    const constraint = await em.findOne(Constraint, id)

    if (!constraint)
        throw createError({
            statusCode: 400,
            statusMessage: `Bad Request: No constraint found with id: ${id}`
        })

    constraint.name = name
    constraint.statement = statement
    constraint.category = category
    constraint.modifiedBy = sessionUser

    await em.flush()
})