import { z } from "zod"
import { fork } from "~/server/data/orm"
import MoscowPriority from "~/server/domain/requirements/MoscowPriority"
import NonFunctionalBehavior from "~/server/domain/requirements/NonFunctionalBehavior"
import Solution from "~/server/domain/application/Solution"

const bodySchema = z.object({
    name: z.string().min(1),
    statement: z.string(),
    solutionId: z.string().uuid(),
    priority: z.nativeEnum(MoscowPriority)
})

/**
 * Creates a new non functional behavior and returns its id
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

    const solution = await em.findOne(Solution, body.data.solutionId)

    if (!solution)
        throw createError({
            statusCode: 400,
            statusMessage: `Bad Request: Solution not found for id ${body.data.solutionId}`
        })

    const newNonFunctionalBehavior = new NonFunctionalBehavior({
        name: body.data.name,
        statement: body.data.statement,
        solution,
        priority: body.data.priority
    })

    await em.persistAndFlush(newNonFunctionalBehavior)

    return newNonFunctionalBehavior.id
})