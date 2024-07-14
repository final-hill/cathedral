import { type Uuid } from "~/server/domain/Uuid"
import { z } from "zod"
import UserStoryRepository from "~/server/data/repositories/UserStoryRepository"
import UserStoryInteractor from "~/server/application/UserStoryInteractor"

const bodySchema = z.object({
    name: z.string(),
    statement: z.string(),
    solutionId: z.string().uuid(),
    primaryActorId: z.string().uuid().optional(),
    priorityId: z.enum(["MUST", "SHOULD", "COULD", "WONT"]),
    outcomeId: z.string().uuid(),
    functionalBehaviorId: z.string().uuid()
})

/**
 * Creates a new user story and returns its id
 */
export default defineEventHandler(async (event) => {
    const userStoryInteractor = new UserStoryInteractor(new UserStoryRepository()),
        body = await readValidatedBody(event, (b) => bodySchema.safeParse(b))

    if (!body.success)
        throw createError({
            statusCode: 400,
            statusMessage: "Bad Request: Invalid body parameters"
        })

    return userStoryInteractor.create({
        name: body.data.name,
        statement: body.data.statement,
        solutionId: body.data.solutionId as Uuid,
        primaryActorId: body.data.primaryActorId as Uuid,
        priorityId: body.data.priorityId,
        outcomeId: body.data.outcomeId as Uuid,
        functionalBehaviorId: body.data.functionalBehaviorId as Uuid
    })
})