import { z } from "zod"
import { fork } from "~/server/data/orm.js"
import { SystemComponent } from "~/server/domain/requirements/index.js"
import { Belongs } from "~/server/domain/relations"

const bodySchema = z.object({
    solutionId: z.string().uuid(),
    name: z.string().default("{Untitled System Component}"),
    description: z.string().default(""),
    parentComponentId: z.string().uuid().optional(),
    isSilence: z.boolean().default(false)
})

/**
 * Creates a new system-component and returns its id
 */
export default defineEventHandler(async (event) => {
    const { name, description, parentComponentId, solutionId, isSilence } = await validateEventBody(event, bodySchema),
        { solution, sessionUser } = await assertSolutionContributor(event, solutionId),
        em = fork()

    const newSystemComponent = new SystemComponent({
        name,
        description,
        lastModified: new Date(),
        modifiedBy: sessionUser,
        isSilence,
        parentComponent: parentComponentId ? em.getReference(SystemComponent, parentComponentId) : undefined
    })

    em.create(Belongs, { left: newSystemComponent, right: solution })

    await em.flush()

    return newSystemComponent.id
})