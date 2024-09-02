import { z } from "zod"
import { Constraint, ConstraintCategory } from "~/server/domain/requirements/index.js"
import { fork } from "~/server/data/orm"

const paramSchema = z.object({
    solutionId: z.string().uuid(),
    id: z.string().uuid()
})

const bodySchema = z.object({
    name: z.string().min(1),
    statement: z.string(),
    category: z.nativeEnum(ConstraintCategory)
})

/**
 * PUT /api/constraints/:id
 *
 * Updates a constraint by id.
 */
export default defineEventHandler(async (event) => {
    const { id, solutionId } = await validateEventParams(event, paramSchema),
        { sessionUser } = await assertSolutionContributor(event, solutionId),
        body = await validateEventBody(event, bodySchema),
        em = fork()

    const constraint = await em.findOne(Constraint, id)

    if (!constraint)
        throw createError({
            statusCode: 400,
            statusMessage: `Bad Request: No constraint found with id: ${id}`
        })

    constraint.name = body.name
    constraint.statement = body.statement
    constraint.category = body.category
    constraint.modifiedBy = sessionUser

    await em.flush()
})