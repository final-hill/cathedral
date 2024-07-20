import { z } from "zod"
import orm from "~/server/data/orm"
import Solution from "~/server/domain/Solution"
import EnvironmentComponent from "~/server/domain/EnvironmentComponent"

const bodySchema = z.object({
    name: z.string(),
    statement: z.string(),
    solutionId: z.string().uuid(),
    parentComponentId: z.string().uuid().nullable()
})

/**
 * POST /api/environment-components
 *
 * Creates a new environment-component and returns its id
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

    const parentComponent = body.data.parentComponentId ? await orm.em.findOne(EnvironmentComponent, body.data.parentComponentId) : null

    const newEnvironmentComponent = new EnvironmentComponent({
        name: body.data.name,
        statement: body.data.statement,
        solution,
        parentComponent: parentComponent ?? undefined
    })

    await orm.em.persistAndFlush(newEnvironmentComponent)
})