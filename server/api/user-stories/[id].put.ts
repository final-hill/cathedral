import UserStoryRepository from "~/server/data/repositories/UserStoryRepository"
import UserStoryInteractor from "~/server/application/UserStoryInteractor"
import { type Uuid } from "~/server/domain/Uuid"
import { z } from "zod"

const bodySchema = z.object({
    name: z.string(),
    statement: z.string(),
    solutionId: z.string().uuid(),
    primaryActorId: z.string().uuid(),
    priorityId: z.enum(["MUST", "SHOULD", "COULD", "WONT"]),
    outcomeId: z.string().uuid(),
    functionalBehaviorId: z.string().uuid()
})

/**
 * Updates a User Story by id
 */
export default defineEventHandler(async (event) => {
    const id = event.context.params?.id,
        userStoryInteractor = new UserStoryInteractor(new UserStoryRepository()),
        body = await readValidatedBody(event, (b) => bodySchema.safeParse(b))

    if (!body.success)
        throw createError({
            statusCode: 400,
            statusMessage: "Bad Request: Invalid body parameters"
        })

    if (id) {
        return userStoryInteractor.update({
            id: id as Uuid,
            name: body.data.name,
            statement: body.data.statement,
            solutionId: body.data.solutionId as Uuid,
            primaryActorId: body.data.primaryActorId as Uuid,
            priorityId: body.data.priorityId,
            outcomeId: body.data.outcomeId as Uuid,
            functionalBehaviorId: body.data.functionalBehaviorId as Uuid
        })
    } else {
        throw createError({
            statusCode: 400,
            statusMessage: "Bad Request: id is required."
        })
    }
})