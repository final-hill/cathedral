import { z } from "zod"
import orm from "~/server/data/orm"
import MoscowPriority from "~/server/domain/MoscowPriority"
import NonFunctionalBehavior from "~/server/domain/NonFunctionalBehavior"
import Solution from "~/server/domain/Solution"

const bodySchema = z.object({
    name: z.string().min(1),
    statement: z.string().min(1),
    solutionId: z.string().uuid(),
    priority: z.nativeEnum(MoscowPriority)
})

/**
 * Creates a new non functional behavior and returns its id
 */
export default defineEventHandler(async (event) => {
    const body = await readValidatedBody(event, (b) => bodySchema.safeParse(b))

    if (!body.success)
        throw createError({
            statusCode: 400,
            statusMessage: "Bad Request: Invalid body parameters"
        })

    const solution = await orm.em.findOne(Solution, body.data.solutionId)

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

    await orm.em.persistAndFlush(newNonFunctionalBehavior)
})