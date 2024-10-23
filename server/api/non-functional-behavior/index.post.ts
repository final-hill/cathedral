import { z } from "zod"
import { fork } from "~/server/data/orm.js"
import { MoscowPriority, NonFunctionalBehavior } from "~/server/domain/requirements/index.js"
import { Belongs } from "~/server/domain/relations"

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

    const newNonFunctionalBehavior = em.create(NonFunctionalBehavior, {
        name,
        description,
        priority,
        lastModified: new Date(),
        modifiedBy: sessionUser,
        isSilence
    })

    em.create(Belongs, { left: newNonFunctionalBehavior, right: solution })

    await em.flush()

    return newNonFunctionalBehavior.id
})