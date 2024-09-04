import { z } from "zod"
import { fork } from "~/server/data/orm"
import { SystemComponent } from "~/server/domain/requirements/index.js"

const paramSchema = z.object({
    solutionId: z.string().uuid(),
    id: z.string().uuid()
})

const bodySchema = z.object({
    name: z.string(),
    statement: z.string(),
    parentComponentId: z.string().uuid().optional()
})

/**
 * Updates an environment component by id.
 */
export default defineEventHandler(async (event) => {
    const { id, solutionId } = await validateEventParams(event, paramSchema),
        { sessionUser } = await assertSolutionContributor(event, solutionId),
        { name, statement, parentComponentId } = await validateEventBody(event, bodySchema),
        em = fork()

    const systemComponent = await em.findOne(SystemComponent, id),
        parentComponent = parentComponentId ? await em.findOne(SystemComponent, parentComponentId) : undefined

    if (!systemComponent)
        throw createError({
            statusCode: 400,
            statusMessage: `Bad Request: No assumption found with id: ${id}`
        })

    systemComponent.name = name
    systemComponent.statement = statement
    systemComponent.parentComponent = parentComponent || undefined
    systemComponent.modifiedBy = sessionUser

    await em.flush()
})