import { z } from "zod"
import { fork } from "~/server/data/orm"
import Solution from "~/server/domain/Solution"
import SystemComponent from "~/server/domain/SystemComponent"
import { type Uuid } from "~/server/domain/Uuid"

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
    const body = await readValidatedBody(event, (b) => bodySchema.safeParse(b)),
        em = fork()

    if (!body.success)
        throw createError({
            statusCode: 400,
            statusMessage: 'Bad Request: Invalid body parameters',
            message: JSON.stringify(body.error.errors)
        })

    const solution = await em.findOne(Solution, body.data.solutionId as Uuid),
        parentComponent = body.data.parentComponentId ? await em.findOne(SystemComponent, body.data.parentComponentId as Uuid) : undefined

    if (!solution)
        throw createError({
            statusCode: 400,
            statusMessage: `Bad Request: Solution not found for id ${body.data.solutionId}`
        })

    const newSystemComponent = new SystemComponent({
        name: body.data.name,
        statement: body.data.statement,
        solution,
        parentComponent: parentComponent || undefined
    })

    await em.persistAndFlush(newSystemComponent)

    return newSystemComponent.id
})