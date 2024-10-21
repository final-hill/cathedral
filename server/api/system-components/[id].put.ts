import { z } from "zod"
import { fork } from "~/server/data/orm.js"
import { SystemComponent } from "~/server/domain/requirements/index.js"

const paramSchema = z.object({
    id: z.string().uuid()
})

const bodySchema = z.object({
    solutionId: z.string().uuid(),
    name: z.string().optional(),
    description: z.string().optional(),
    parentComponentId: z.string().uuid().optional(),
    isSilence: z.boolean().optional()
})

/**
 * Updates an environment component by id.
 */
export default defineEventHandler(async (event) => {
    const { id } = await validateEventParams(event, paramSchema),
        { name, description, parentComponentId, solutionId, isSilence } = await validateEventBody(event, bodySchema),
        { sessionUser, solution } = await assertSolutionContributor(event, solutionId),
        em = fork(),
        systemComponent = await assertReqBelongsToSolution(em, SystemComponent, id, solution)

    if (parentComponentId)
        systemComponent.parentComponent = await assertReqBelongsToSolution(em, SystemComponent, parentComponentId, solution)

    systemComponent.assign({
        name: name ?? systemComponent.name,
        description: description ?? systemComponent.description,
        isSilence: isSilence ?? systemComponent.isSilence,
        modifiedBy: sessionUser,
        lastModified: new Date()
    })

    await em.flush()
})