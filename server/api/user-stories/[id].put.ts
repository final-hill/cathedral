import { z } from "zod"
import orm from "~/server/data/orm"
import FunctionalBehavior from "~/server/domain/FunctionalBehavior"
import MoscowPriority from "~/server/domain/MoscowPriority"
import Outcome from "~/server/domain/Outcome"
import Solution from "~/server/domain/Solution"
import Stakeholder from "~/server/domain/Stakeholder"
import UserStory from "~/server/domain/UserStory"

const bodySchema = z.object({
    name: z.string(),
    statement: z.string(),
    solutionId: z.string().uuid(),
    primaryActorId: z.string().uuid(),
    priority: z.nativeEnum(MoscowPriority),
    outcomeId: z.string().uuid(),
    functionalBehaviorId: z.string().uuid()
})

/**
 * Updates a User Story by id
 */
export default defineEventHandler(async (event) => {
    const id = event.context.params?.id,
        body = await readValidatedBody(event, (b) => bodySchema.safeParse(b))

    if (!body.success)
        throw createError({
            statusCode: 400,
            statusMessage: "Bad Request: Invalid body parameters"
        })

    if (id) {
        const userStory = await orm.em.findOne(UserStory, id),
            solution = await orm.em.findOne(Solution, body.data.solutionId),
            primaryActor = await orm.em.findOne(Stakeholder, body.data.primaryActorId),
            outcome = await orm.em.findOne(Outcome, body.data.outcomeId),
            functionalBehavior = await orm.em.findOne(FunctionalBehavior, body.data.functionalBehaviorId)

        if (!userStory)
            throw createError({
                statusCode: 400,
                statusMessage: `Bad Request: No user story found with id: ${id}`
            })
        if (!solution)
            throw createError({
                statusCode: 400,
                statusMessage: `Bad Request: No solution found with id: ${body.data.solutionId}`
            })
        if (!primaryActor)
            throw createError({
                statusCode: 400,
                statusMessage: `Bad Request: No primary actor found with id: ${body.data.primaryActorId}`
            })
        if (!outcome)
            throw createError({
                statusCode: 400,
                statusMessage: `Bad Request: No outcome found with id: ${body.data.outcomeId}`
            })
        if (!functionalBehavior)
            throw createError({
                statusCode: 400,
                statusMessage: `Bad Request: No functional behavior found with id: ${body.data.functionalBehaviorId}`
            })

        userStory.name = body.data.name
        userStory.statement = body.data.statement
        userStory.solution = solution
        userStory.primaryActor = primaryActor
        userStory.priority = body.data.priority
        userStory.outcome = outcome
        userStory.functionalBehavior = functionalBehavior

        await orm.em.flush()
    } else {
        throw createError({
            statusCode: 400,
            statusMessage: "Bad Request: id is required."
        })
    }
})