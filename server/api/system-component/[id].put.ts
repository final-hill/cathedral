import { z } from "zod"
import { fork } from "~/server/data/orm.js"
import { Belongs } from "~/server/domain/relations"
import { SystemComponent } from "~/server/domain/requirements/index.js"

const paramSchema = z.object({
    id: z.string().uuid()
})

const bodySchema = z.object({
    solutionId: z.string().uuid(),
    name: z.string().optional(),
    description: z.string().optional(),
    parentComponent: z.string().uuid().optional(),
    isSilence: z.boolean().optional()
})

/**
 * Updates an environment component by id.
 */
export default defineEventHandler(async (event) => {
    const { id } = await validateEventParams(event, paramSchema),
        { name, description, parentComponent, solutionId, isSilence } = await validateEventBody(event, bodySchema),
        { sessionUser, solution } = await assertSolutionContributor(event, solutionId),
        em = fork(),
        systemComponent = await assertReqBelongsToSolution(em, SystemComponent, id, solution),
        pComponent = parentComponent ? await assertReqBelongsToSolution(em, SystemComponent, parentComponent, solution) : undefined

    const existingParentComponent = await em.findOne(Belongs, {
        left: systemComponent,
        right: pComponent
    })

    systemComponent.assign({
        name: name ?? systemComponent.name,
        description: description ?? systemComponent.description,
        isSilence: isSilence ?? systemComponent.isSilence,
        modifiedBy: sessionUser,
        lastModified: new Date()
    })

    if (!existingParentComponent && pComponent) {
        em.create(Belongs, { left: systemComponent, right: pComponent })
    } else if (existingParentComponent && !pComponent) {
        em.remove(existingParentComponent)
    } else if (existingParentComponent && pComponent) {
        em.remove(existingParentComponent)
        em.create(Belongs, { left: systemComponent, right: pComponent })
    } else {
        // Do nothing
    }

    await em.persistAndFlush(systemComponent)
})