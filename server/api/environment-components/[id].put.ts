import { z } from "zod"
import { fork } from "~/server/data/orm"
import { EnvironmentComponent } from "~/server/domain/requirements/index.js"

const paramSchema = z.object({
    id: z.string().uuid()
})

const bodySchema = z.object({
    solutionId: z.string().uuid(),
    name: z.string().default("{Untitled Environment Component}"),
    statement: z.string().default(""),
    parentComponentId: z.string().uuid().optional()
})

/**
 * Updates an assumption by id.
 */
export default defineEventHandler(async (event) => {
    const { id } = await validateEventParams(event, paramSchema),
        { name, statement, parentComponentId, solutionId } = await validateEventBody(event, bodySchema),
        { sessionUser } = await assertSolutionContributor(event, solutionId),
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