import { type Uuid } from "~/server/domain/Uuid"
import { z } from "zod"
import GoalRepository from "~/server/data/repositories/GoalRepository"
import GoalInteractor from "~/server/application/GoalInteractor"

const bodySchema = z.object({
    name: z.string(),
    statement: z.string(),
    solutionId: z.string()
})

/**
 * PUT /api/goals/:id
 *   body: {
 *     name: string,
 *     statement: string
 *     solutionId: Uuid
 *   }
 *
 * Updates a goal by id.
 */
export default defineEventHandler(async (event) => {
    const id = event.context.params?.id,
        goalInteractor = new GoalInteractor(new GoalRepository()),
        body = await readValidatedBody(event, (b) => bodySchema.safeParse(b))

    if (!body.success)
        throw createError({
            statusCode: 400,
            statusMessage: "Bad Request: Invalid body parameters"
        })

    if (id) {
        return goalInteractor.update({
            id: id as Uuid,
            name: body.data.name,
            statement: body.data.statement,
            solutionId: body.data.solutionId as Uuid
        })
    } else {
        throw createError({
            statusCode: 400,
            statusMessage: "Bad Request: id is required."
        })
    }
})