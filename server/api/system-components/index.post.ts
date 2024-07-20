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
 * POST /api/system-components
 *
 * Creates a new system-component and returns its id
 */
export default defineEventHandler(async (event) => {
    const body = await readValidatedBody(event, (b) => bodySchema.safeParse(b))

    if (!body.success)
        throw createError({
            statusCode: 400,
            statusMessage: "Bad Request: Invalid body parameters"
        })

    const solution = await orm.em.findOne(Solution, body.data.solutionId),
        parentComponent = body.data.parentComponentId ? await orm.em.findOne(SystemComponent, body.data.parentComponentId) : undefined

    if (!solution)
        throw createError({
            statusCode: 400,
            statusMessage: `Bad Request: Solution not found for id ${body.data.solutionId}`
        })
    if (!parentComponent)
        throw createError({
            statusCode: 400,
            statusMessage: `Bad Request: Parent stakeholder not found for id ${body.data.parentComponentId}`
        })

    const newSystemComponent = new SystemComponent({
        name: body.data.name,
        statement: body.data.statement,
        solution,
        parentComponent: parentComponent || undefined
    })

    await orm.em.persistAndFlush(newSystemComponent)
})