import { fork } from "~/server/data/orm.js"
import { z } from "zod"
import { MoscowPriority, FunctionalBehavior } from "~/domain/requirements/index.js"
import { Belongs } from "~/domain/relations"

const bodySchema = z.object({
    solutionId: z.string().uuid(),
    name: z.string().default("{Untitled Functional Behavior}"),
    description: z.string().default(""),
    priority: z.nativeEnum(MoscowPriority),
    isSilence: z.boolean().default(false)
})

/**
 * Creates a new functional behavior and returns its id
 */
export default defineEventHandler(async (event) => {
    const { name, priority, description, solutionId, isSilence } = await validateEventBody(event, bodySchema),
        { solution, sessionUser } = await assertSolutionContributor(event, solutionId),
        em = fork()

    const newId = await em.transactional(async (em) => {
        const newFunctionalBehavior = em.create(FunctionalBehavior, {
            reqId: await getNextReqId('S.2.', em, solution) as FunctionalBehavior['reqId'],
            name,
            description,
            priority,
            lastModified: new Date(),
            createdBy: sessionUser,
            modifiedBy: sessionUser,
            isSilence
        })

        em.create(Belongs, {
            left: newFunctionalBehavior,
            right: solution
        })

        await em.flush()

        return newFunctionalBehavior.id
    })

    return newId
})