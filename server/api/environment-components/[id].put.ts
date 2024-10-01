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
    parentComponentId: z.string().uuid().optional(),
    isSilence: z.boolean().optional()
})

/**
 * Updates an assumption by id.
 */
export default defineEventHandler(async (event) => {
    const { id } = await validateEventParams(event, paramSchema),
        { name, statement, parentComponentId, solutionId, isSilence } = await validateEventBody(event, bodySchema),
        { sessionUser } = await assertSolutionContributor(event, solutionId),
        em = fork(),
        environmentComponent = await em.findOne(EnvironmentComponent, id)

    if (!environmentComponent)
        throw createError({
            statusCode: 400,
            statusMessage: `Bad Request: No effect found with id: ${id}`
        })

    if (parentComponentId)
        environmentComponent.parentComponent = em.getReference(EnvironmentComponent, parentComponentId)

    Object.assign(environmentComponent, {
        name,
        statement,
        modifiedBy: sessionUser,
        lastModified: new Date(),
        ...(isSilence !== undefined && { isSilence })
    })

    await em.flush()
})