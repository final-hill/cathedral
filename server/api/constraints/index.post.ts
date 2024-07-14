import { type Uuid } from "~/server/domain/Uuid"
import { z } from "zod"
import ConstraintInteractor from "~/server/application/ConstraintInteractor"
import ConstraintRepository from "~/server/data/repositories/ConstraintRepository"
import ConstraintCategory from "~/server/domain/ConstraintCategory"

const bodySchema = z.object({
    name: z.string().min(1),
    statement: z.string().min(1),
    solutionId: z.string().uuid(),
    categoryId: z.enum(['BUSINESS', 'ENGINEERING', 'PHYSICS'])
})

/**
 * POST /api/constraints
 *
 * Creates a new constraint and returns its id
 */
export default defineEventHandler(async (event) => {
    const constraintInteractor = new ConstraintInteractor(new ConstraintRepository()),
        body = await readValidatedBody(event, (b) => bodySchema.safeParse(b))

    if (!body.success)
        throw createError({
            statusCode: 400,
            statusMessage: "Bad Request: Invalid body parameters"
        })

    return constraintInteractor.create({
        name: body.data.name,
        statement: body.data.statement,
        solutionId: body.data.solutionId as Uuid,
        categoryId: body.data.categoryId as keyof Omit<typeof ConstraintCategory, 'prototype'>
    })
})