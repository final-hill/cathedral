import { z } from "zod"
import orm from "~/server/data/orm"
import Solution from "~/server/domain/Solution"
import SystemComponent from "~/server/domain/SystemComponent"

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
        body = await readValidatedBody(event, (b) => bodySchema.safeParse(b))

    if (!body.success)
        throw createError({
            statusCode: 400,
            statusMessage: "Bad Request: Invalid body parameters"
        })

    if (id) {
        const systemComponent = await orm.em.findOne(SystemComponent, id),
            solution = await orm.em.findOne(Solution, body.data.solutionId),
            parentComponent = body.data.parentComponentId ? await orm.em.findOne(SystemComponent, body.data.parentComponentId) : undefined

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

        await orm.em.flush()
    } else {
        throw createError({
            statusCode: 400,
            statusMessage: "Bad Request: id is required."
        })
    }
})