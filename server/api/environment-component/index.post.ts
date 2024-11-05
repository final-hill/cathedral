import { z } from "zod"
import { fork } from "~/server/data/orm.js"
import { EnvironmentComponent } from "~/domain/requirements/index.js"
import { Belongs } from "~/domain/relations"

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

    const newId = await em.transactional(async (em) => {
        const newEnvironmentComponent = em.create(EnvironmentComponent, {
            reqId: await getNextReqId('E.2.', em, solution) as EnvironmentComponent['reqId'],
            name,
            description,
            lastModified: new Date(),
            createdBy: sessionUser,
            modifiedBy: sessionUser,
            isSilence
        })

        em.create(Belongs, {
            left: newEnvironmentComponent,
            right: solution
        })

        if (parentComponentId)
            em.create(Belongs, { left: newEnvironmentComponent, right: parentComponentId })

        await em.flush()

        return newEnvironmentComponent.id
    })

    return newId
})