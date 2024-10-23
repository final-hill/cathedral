import { z } from "zod"
import { fork } from "~/server/data/orm.js"
import { Belongs } from "~/domain/relations"
import { EnvironmentComponent } from "~/domain/requirements/index.js"

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
 * Updates an assumption by id.
 */
export default defineEventHandler(async (event) => {
    const { id } = await validateEventParams(event, paramSchema),
        { name, description, parentComponentId, solutionId, isSilence } = await validateEventBody(event, bodySchema),
        { sessionUser, solution } = await assertSolutionContributor(event, solutionId),
        em = fork(),
        environmentComponent = await assertReqBelongsToSolution(em, EnvironmentComponent, id, solution),
        parentComponent = parentComponentId ? await assertReqBelongsToSolution(em, EnvironmentComponent, parentComponentId, solution) : undefined

    environmentComponent.assign({
        name: name ?? environmentComponent.name,
        description: description ?? environmentComponent.description,
        isSilence: isSilence ?? environmentComponent.isSilence,
        modifiedBy: sessionUser,
        lastModified: new Date()
    })

    const existingParentComponent = await em.findOne(Belongs, {
        left: environmentComponent,
        right: parentComponent
    })

    if (!existingParentComponent && parentComponent) {
        em.create(Belongs, { left: environmentComponent, right: parentComponent })
    } else if (existingParentComponent && !parentComponent) {
        em.remove(existingParentComponent)
    } else if (existingParentComponent && parentComponent) {
        em.remove(existingParentComponent)
        em.create(Belongs, { left: environmentComponent, right: parentComponent })
    } else {
        // Do nothing
    }

    await em.persistAndFlush(environmentComponent)
})