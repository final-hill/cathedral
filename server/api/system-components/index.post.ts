import { z } from "zod"
import { fork } from "~/server/data/orm"
import { SystemComponent } from "~/server/domain/requirements/index.js"

const bodySchema = z.object({
    solutionId: z.string().uuid(),
    name: z.string().default("{Untitled System Component}"),
    statement: z.string().default(""),
    parentComponentId: z.string().uuid().optional(),
    isSilence: z.boolean().default(false)
})

/**
 * Creates a new system-component and returns its id
 */
export default defineEventHandler(async (event) => {
    const { name, statement, parentComponentId, solutionId, isSilence } = await validateEventBody(event, bodySchema),
        { solution, sessionUser } = await assertSolutionContributor(event, solutionId),
        em = fork()

    const newSystemComponent = new SystemComponent({
        name,
        statement,
        solution,
        lastModified: new Date(),
        modifiedBy: sessionUser,
        isSilence,
        parentComponent: parentComponentId ? em.getReference(SystemComponent, parentComponentId) : undefined
    })

    await em.persistAndFlush(newSystemComponent)

    return newSystemComponent.id
})