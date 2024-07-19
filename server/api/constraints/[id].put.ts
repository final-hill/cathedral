import { type Uuid } from "~/server/domain/Uuid"
import { z } from "zod"
import ConstraintInteractor from "~/server/application/ConstraintInteractor"
import ConstraintRepository from "~/server/data/repositories/ConstraintRepository"
import ConstraintCategory from "~/server/domain/requirements/ConstraintCategory"

const bodySchema = z.object({
    name: z.string().min(1),
    statement: z.string().min(1),
    solutionId: z.string().uuid(),
    categoryId: z.enum(['BUSINESS', 'ENGINEERING', 'PHYSICS'])
})

/**
 * PUT /api/constraints/:id
 *
 * Updates a constraint by id.
 */
export default defineEventHandler(async (event) => {
    const id = event.context.params?.id,
        constraintInteractor = new ConstraintInteractor(new ConstraintRepository()),
        body = await readValidatedBody(event, (b) => bodySchema.safeParse(b))

    if (!body.success)
        throw createError({
            statusCode: 400,
            statusMessage: "Bad Request: Invalid body parameters"
        })

    if (id) {
        return constraintInteractor.update({
            id: id as Uuid,
            name: body.data.name,
            statement: body.data.statement,
            solutionId: body.data.solutionId as Uuid,
            categoryId: body.data.categoryId as keyof Omit<typeof ConstraintCategory, 'prototype'>
        })
    } else {
        throw createError({
            statusCode: 400,
            statusMessage: "Bad Request: id is required."
        })
    }
})