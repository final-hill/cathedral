import { z } from "zod"
import { fork } from "~/server/data/orm.js"
import { Belongs } from "~/domain/relations"
import { EnvironmentComponent, environmentComponentReqIdPrefix } from "~/domain/requirements/index.js"

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

    // If the entity is no longer silent and has no reqId, assume
    // that it is a new requirement from the workbox
    if (isSilence !== undefined && isSilence == false && !environmentComponent.reqId)
        environmentComponent.reqId = await getNextReqId(environmentComponentReqIdPrefix, em, solution) as EnvironmentComponent['reqId']

    await em.persistAndFlush(environmentComponent)
})