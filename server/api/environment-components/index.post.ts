import { z } from "zod"
import { fork } from "~/server/data/orm.js"
import { EnvironmentComponent } from "~/server/domain/requirements/index.js"
import { Belongs } from "~/server/domain/relations"

const bodySchema = z.object({
    solutionId: z.string().uuid(),
    name: z.string().default("{Untitled Environment Component}"),
    description: z.string().default(""),
    parentComponentId: z.string().uuid().optional(),
    isSilence: z.boolean().default(false)
})

/**
 * Creates a new environment-component and returns its id
 */
export default defineEventHandler(async (event) => {
    const { name, description, parentComponentId, solutionId, isSilence } = await validateEventBody(event, bodySchema),
        { solution, sessionUser } = await assertSolutionContributor(event, solutionId),
        em = fork()

    const newEnvironmentComponent = em.create(EnvironmentComponent, {
        name,
        description,
        lastModified: new Date(),
        modifiedBy: sessionUser,
        isSilence,
        parentComponent: parentComponentId ? em.getReference(EnvironmentComponent, parentComponentId) : undefined
    })

    em.create(Belongs, { left: newEnvironmentComponent, right: solution })

    await em.flush()

    return newEnvironmentComponent.id
})