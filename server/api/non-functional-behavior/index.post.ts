import { z } from "zod"
import { fork } from "~/server/data/orm.js"
import { MoscowPriority, NonFunctionalBehavior } from "~/domain/requirements/index.js"
import { Belongs } from "~/domain/relations"

const bodySchema = z.object({
    solutionId: z.string().uuid(),
    name: z.string().default("{Untitled Non-Functional Behavior}"),
    description: z.string().default(""),
    priority: z.nativeEnum(MoscowPriority).default(MoscowPriority.MUST),
    isSilence: z.boolean().default(false)
})

/**
 * Creates a new non functional behavior and returns its id
 */
export default defineEventHandler(async (event) => {
    const { name, priority, description, solutionId, isSilence } = await validateEventBody(event, bodySchema),
        { solution, sessionUser } = await assertSolutionContributor(event, solutionId),
        em = fork()

    const newId = await em.transactional(async (em) => {
        const newNonFunctionalBehavior = em.create(NonFunctionalBehavior, {
            reqId: await getNextReqId('S.2.', em, solution) as NonFunctionalBehavior['reqId'],
            name,
            description,
            priority,
            lastModified: new Date(),
            modifiedBy: sessionUser,
            isSilence
        })

        em.create(Belongs, {
            left: newNonFunctionalBehavior,
            right: solution
        })

        await em.flush()

        return newNonFunctionalBehavior.id
    })

    return newId
})