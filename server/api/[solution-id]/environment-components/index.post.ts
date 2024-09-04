import { z } from "zod"
import { fork } from "~/server/data/orm"
import { EnvironmentComponent } from "~/server/domain/requirements/index.js"

const paramSchema = z.object({
    solutionId: z.string().uuid()
})

const bodySchema = z.object({
    name: z.string(),
    statement: z.string(),
    parentComponentId: z.string().uuid().optional()
})

/**
 * Creates a new environment-component and returns its id
 */
export default defineEventHandler(async (event) => {
    const { solutionId } = await validateEventParams(event, paramSchema),
        { name, statement, parentComponentId } = await validateEventBody(event, bodySchema),
        { solution, sessionUser } = await assertSolutionContributor(event, solutionId),
        em = fork()

    const parentComponent = parentComponentId ? await em.findOne(EnvironmentComponent, parentComponentId) : null

    const newEnvironmentComponent = new EnvironmentComponent({
        name,
        statement,
        solution,
        parentComponent: parentComponent ?? undefined,
        lastModified: new Date(),
        modifiedBy: sessionUser
    })

    await em.persistAndFlush(newEnvironmentComponent)

    return newEnvironmentComponent.id
})