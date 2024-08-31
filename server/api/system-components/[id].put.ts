import { z } from "zod"
import { fork } from "~/server/data/orm"
import Solution from "~/server/domain/application/Solution"
import { SystemComponent } from "~/server/domain/requirements/index"

const bodySchema = z.object({
    name: z.string(),
    statement: z.string(),
    solutionId: z.string().uuid(),
    parentComponentId: z.string().uuid().optional()
})

/**
 * Updates an environment component by id.
 */
export default defineEventHandler(async (event) => {
    const id = event.context.params?.id,
        body = await readValidatedBody(event, (b) => bodySchema.safeParse(b)),
        em = fork()

    if (!body.success)
        throw createError({
            statusCode: 400,
            statusMessage: 'Bad Request: Invalid body parameters',
            message: JSON.stringify(body.error.errors)
        })

    if (id) {
        const systemComponent = await em.findOne(SystemComponent, id),
            solution = await em.findOne(Solution, body.data.solutionId),
            parentComponent = body.data.parentComponentId ? await em.findOne(SystemComponent, body.data.parentComponentId) : undefined

        if (!systemComponent)
            throw createError({
                statusCode: 400,
                statusMessage: `Bad Request: No assumption found with id: ${id}`
            })
        if (!solution)
            throw createError({
                statusCode: 400,
                statusMessage: `Bad Request: No solution found with id: ${body.data.solutionId}`
            })

        systemComponent.name = body.data.name
        systemComponent.statement = body.data.statement
        systemComponent.solution = solution
        systemComponent.parentComponent = parentComponent || undefined

        await em.flush()
    } else {
        throw createError({
            statusCode: 400,
            statusMessage: "Bad Request: id is required."
        })
    }
})