import { z } from "zod"
import { fork } from "~/server/data/orm"
import EnvironmentComponent from "~/server/domain/requirements/EnvironmentComponent"
import Solution from "~/server/domain/application/Solution"

const bodySchema = z.object({
    name: z.string(),
    statement: z.string(),
    solutionId: z.string().uuid(),
    parentComponentId: z.string().uuid().optional()
})

/**
 * PUT /api/environment-components/:id
 *
 * Updates an assumption by id.
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
        const environmentComponent = await em.findOne(EnvironmentComponent, id),
            parentComponent = body.data.parentComponentId ? await em.findOne(EnvironmentComponent, body.data.parentComponentId) : null,
            solution = await em.findOne(Solution, body.data.solutionId)

        if (!environmentComponent)
            throw createError({
                statusCode: 400,
                statusMessage: `Bad Request: No effect found with id: ${id}`
            })
        if (!solution)
            throw createError({
                statusCode: 400,
                statusMessage: `Bad Request: No solution found with id: ${body.data.solutionId}`
            })

        environmentComponent.name = body.data.name
        environmentComponent.statement = body.data.statement
        environmentComponent.solution = solution
        environmentComponent.parentComponent = parentComponent ?? undefined

        await em.flush()
    } else {
        throw createError({
            statusCode: 400,
            statusMessage: "Bad Request: id is required."
        })
    }
})