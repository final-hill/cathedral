import { z } from "zod"
import { fork } from "~/server/data/orm.js"
import { EnvironmentComponent } from "~/server/domain/index.js"

const bodySchema = z.object({
    solutionId: z.string().uuid(),
    name: z.string().default("{Untitled Environment Component}"),
    statement: z.string().default(""),
    parentComponentId: z.string().uuid().optional(),
    isSilence: z.boolean().default(false)
})

/**
 * Creates a new environment-component and returns its id
 */
export default defineEventHandler(async (event) => {
    const { name, statement, parentComponentId, solutionId, isSilence } = await validateEventBody(event, bodySchema),
        { solution, sessionUser } = await assertSolutionContributor(event, solutionId),
        em = fork()

    const newEnvironmentComponent = new EnvironmentComponent({
        name,
        statement,
        solution,
        lastModified: new Date(),
        modifiedBy: sessionUser,
        isSilence,
        parentComponent: parentComponentId ? em.getReference(EnvironmentComponent, parentComponentId) : undefined
    })

    await em.persistAndFlush(newEnvironmentComponent)

    return newEnvironmentComponent.id
})