import { z } from "zod"
import { fork } from "~/server/data/orm.js"
import { SystemComponent } from "~/server/domain/index.js"

const paramSchema = z.object({
    id: z.string().uuid()
})

const bodySchema = z.object({
    solutionId: z.string().uuid(),
    name: z.string().optional(),
    statement: z.string().optional(),
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
        name: name ?? systemComponent.name,
        statement: statement ?? systemComponent.statement,
        isSilence: isSilence ?? systemComponent.isSilence,
        modifiedBy: sessionUser,
        lastModified: new Date()
    })

    await em.persistAndFlush(systemComponent)
})