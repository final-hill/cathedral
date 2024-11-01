import { z } from "zod"
import { fork } from "~/server/data/orm.js"
import { SystemComponent } from "~/domain/requirements/index.js"
import { Belongs } from "~/domain/relations"

const bodySchema = z.object({
    solutionId: z.string().uuid(),
    name: z.string().default("{Untitled System Component}"),
    description: z.string().default(""),
    parentComponent: z.string().uuid().optional(),
    isSilence: z.boolean().default(false)
})

/**
 * Creates a new system-component and returns its id
 */
export default defineEventHandler(async (event) => {
    const { name, description, parentComponent, solutionId, isSilence } = await validateEventBody(event, bodySchema),
        { solution, sessionUser } = await assertSolutionContributor(event, solutionId),
        em = fork()

    const newId = await em.transactional(async (em) => {
        const newSystemComponent = new SystemComponent({
            reqId: await getNextReqId('S.1.', em, solution) as SystemComponent['reqId'],
            name,
            description,
            lastModified: new Date(),
            modifiedBy: sessionUser,
            isSilence
        })

        em.create(Belongs, {
            left: newSystemComponent,
            right: solution
        })

        if (parentComponent)
            em.create(Belongs, { left: newSystemComponent, right: parentComponent })

        await em.flush()

        return newSystemComponent.id
    })

    return newId
})