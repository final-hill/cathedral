import { z } from "zod"
import { fork } from "~/server/data/orm"
import { SystemComponent } from "~/server/domain/requirements/index.js"

const paramSchema = z.object({
    id: z.string().uuid()
})

const bodySchema = z.object({
    solutionId: z.string().uuid(),
    name: z.string().default("{Untitled Component}"),
    statement: z.string().default(""),
    parentComponentId: z.string().uuid().optional(),
    isSilence: z.boolean().optional()
})

/**
 * Updates an environment component by id.
 */
export default defineEventHandler(async (event) => {
    const { id } = await validateEventParams(event, paramSchema),
        { name, statement, parentComponentId, solutionId, isSilence } = await validateEventBody(event, bodySchema),
        { sessionUser } = await assertSolutionContributor(event, solutionId),
        em = fork(),
        systemComponent = await em.findOne(SystemComponent, id)

    if (!systemComponent)
        throw createError({
            statusCode: 400,
            statusMessage: `Bad Request: No assumption found with id: ${id}`
        })

    if (parentComponentId)
        systemComponent.parentComponent = em.getReference(SystemComponent, parentComponentId)

    Object.assign(systemComponent, {
        name,
        statement,
        modifiedBy: sessionUser,
        lastModified: new Date(),
        ...(isSilence !== undefined && { isSilence })
    })

    await em.flush()
})