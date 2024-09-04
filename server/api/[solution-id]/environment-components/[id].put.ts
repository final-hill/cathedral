import { z } from "zod"
import { fork } from "~/server/data/orm"
import { EnvironmentComponent } from "~/server/domain/requirements/index.js"

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
 * Updates an assumption by id.
 */
export default defineEventHandler(async (event) => {
    const { id, solutionId } = await validateEventParams(event, paramSchema),
        { sessionUser } = await assertSolutionContributor(event, solutionId),
        { name, statement, parentComponentId } = await validateEventBody(event, bodySchema),
        em = fork()

    const environmentComponent = await em.findOne(EnvironmentComponent, id),
        parentComponent = parentComponentId ? await em.findOne(EnvironmentComponent, parentComponentId) : null

    if (!environmentComponent)
        throw createError({
            statusCode: 400,
            statusMessage: `Bad Request: No effect found with id: ${id}`
        })

    environmentComponent.name = name
    environmentComponent.statement = statement
    environmentComponent.parentComponent = parentComponent ?? undefined
    environmentComponent.modifiedBy = sessionUser

    await em.flush()
})