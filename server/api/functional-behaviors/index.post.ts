import { fork } from "~/server/data/orm"
import { z } from "zod"
import { MoscowPriority, FunctionalBehavior } from "~/server/domain/requirements/index.js"

const bodySchema = z.object({
    solutionId: z.string().uuid(),
    name: z.string().default("{Untitled Functional Behavior}"),
    statement: z.string().default(""),
    priority: z.nativeEnum(MoscowPriority)
})

/**
 * Creates a new functional behavior and returns its id
 */
export default defineEventHandler(async (event) => {
    const { name, priority, statement, solutionId } = await validateEventBody(event, bodySchema),
        { solution, sessionUser } = await assertSolutionContributor(event, solutionId),
        em = fork()

    const newFunctionalBehavior = new FunctionalBehavior({
        name,
        statement,
        solution,
        priority,
        lastModified: new Date(),
        modifiedBy: sessionUser
    })

    await em.persistAndFlush(newFunctionalBehavior)

    return newFunctionalBehavior.id
})