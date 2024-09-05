import { z } from "zod"
import { fork } from "~/server/data/orm"
import { SystemComponent } from "~/server/domain/requirements/index.js"

const bodySchema = z.object({
    solutionId: z.string().uuid(),
    name: z.string(),
    statement: z.string(),
    parentComponentId: z.string().uuid().optional()
})

/**
 * Creates a new system-component and returns its id
 */
export default defineEventHandler(async (event) => {
    const { name, statement, parentComponentId, solutionId } = await validateEventBody(event, bodySchema),
        { solution, sessionUser } = await assertSolutionContributor(event, solutionId),
        em = fork(),
        parentComponent = parentComponentId ? await em.findOne(SystemComponent, parentComponentId) : undefined

    const newSystemComponent = new SystemComponent({
        name,
        statement,
        solution,
        parentComponent: parentComponent || undefined,
        lastModified: new Date(),
        modifiedBy: sessionUser
    })

    await em.persistAndFlush(newSystemComponent)

    return newSystemComponent.id
})