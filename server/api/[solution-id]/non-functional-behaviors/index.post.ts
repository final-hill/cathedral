import { z } from "zod"
import { fork } from "~/server/data/orm"
import { MoscowPriority, NonFunctionalBehavior } from "~/server/domain/requirements/index.js"

const paramSchema = z.object({
    solutionId: z.string().uuid()
})

const bodySchema = z.object({
    name: z.string().min(1),
    statement: z.string(),
    priority: z.nativeEnum(MoscowPriority)
})

/**
 * Creates a new non functional behavior and returns its id
 */
export default defineEventHandler(async (event) => {
    const { solutionId } = await validateEventParams(event, paramSchema),
        { name, priority, statement } = await validateEventBody(event, bodySchema),
        { solution, sessionUser } = await assertSolutionContributor(event, solutionId),
        em = fork()

    const newNonFunctionalBehavior = new NonFunctionalBehavior({
        name,
        statement,
        solution,
        priority,
        lastModified: new Date(),
        modifiedBy: sessionUser
    })

    await em.persistAndFlush(newNonFunctionalBehavior)

    return newNonFunctionalBehavior.id
})