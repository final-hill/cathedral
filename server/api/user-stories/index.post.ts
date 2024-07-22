import { z } from "zod"
import MoscowPriority from "~/server/domain/MoscowPriority"
import Solution from "~/server/domain/Solution"
import { fork } from "~/server/data/orm"
import Outcome from "~/server/domain/Outcome"
import Stakeholder from "~/server/domain/Stakeholder"
import FunctionalBehavior from "~/server/domain/FunctionalBehavior"
import UserStory from "~/server/domain/UserStory"
import { type Uuid } from "~/server/domain/Uuid"

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
 * Creates a new user story and returns its id
 */
export default defineEventHandler(async (event) => {
    const body = await readValidatedBody(event, (b) => bodySchema.safeParse(b)),
        em = fork()

    if (!body.success)
        throw createError({
            statusCode: 400,
            statusMessage: 'Bad Request: Invalid body parameters',
            message: JSON.stringify(body.error.errors)
        })

    const [solution, primaryActor, outcome, functionalBehavior] = await Promise.all([
        em.findOne(Solution, body.data.solutionId as Uuid),
        em.findOne(Stakeholder, body.data.primaryActorId as Uuid),
        em.findOne(Outcome, body.data.outcomeId as Uuid),
        em.findOne(FunctionalBehavior, body.data.functionalBehaviorId as Uuid)
    ]);

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

    const newUserStory = new UserStory({
        functionalBehavior,
        outcome,
        name: body.data.name,
        statement: body.data.statement,
        solution,
        primaryActor,
        priority: body.data.priority
    })

    await em.persistAndFlush(newUserStory)

    return newUserStory.id
})