import { z } from "zod"
import { fork } from "~/server/data/orm.js"
import { MoscowPriority, NonFunctionalBehavior } from "~/server/domain/index.js"

const bodySchema = z.object({
    solutionId: z.string().uuid(),
    name: z.string().default("{Untitled Non-Functional Behavior}"),
    statement: z.string().default(""),
    priority: z.nativeEnum(MoscowPriority).default(MoscowPriority.MUST),
    isSilence: z.boolean().default(false)
})

/**
 * Creates a new non functional behavior and returns its id
 */
export default defineEventHandler(async (event) => {
    const { name, priority, statement, solutionId, isSilence } = await validateEventBody(event, bodySchema),
        { solution, sessionUser } = await assertSolutionContributor(event, solutionId),
        em = fork()

    const newNonFunctionalBehavior = new NonFunctionalBehavior({
        name,
        statement,
        solution,
        priority,
        lastModified: new Date(),
        modifiedBy: sessionUser,
        isSilence
    })

    await em.persistAndFlush(newNonFunctionalBehavior)

    return newNonFunctionalBehavior.id
})