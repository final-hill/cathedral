import { type Uuid } from "~/server/domain/Uuid"
import { z } from "zod"
import GoalInteractor from "~/server/application/GoalInteractor"
import GoalRepository from "~/server/data/repositories/GoalRepository"

const bodySchema = z.object({
    name: z.string().min(1),
    statement: z.string().min(0),
    solutionId: z.string().uuid()
})

/**
 * POST /api/goals
 *   body: {
 *     name: string,
 *     statement: string,
 *     solutionId: Uuid
 *   }
 *
 * Creates a new goal and returns its id
 */
export default defineEventHandler(async (event) => {
    const goalInteractor = new GoalInteractor(new GoalRepository()),
        body = await readValidatedBody(event, (b) => bodySchema.safeParse(b))

    if (!body.success)
        throw createError({
            statusCode: 400,
            statusMessage: "Bad Request: Invalid body parameters"
        })

    return goalInteractor.create({
        name: body.data.name,
        statement: body.data.statement,
        solutionId: body.data.solutionId as Uuid
    })
})