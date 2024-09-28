import { z } from "zod"
import { fork } from "~/server/data/orm"
import { Outcome } from "~/server/domain/requirements/index.js"

const bodySchema = z.object({
    solutionId: z.string().uuid(),
    name: z.string().default("{Untitled Outcome}"),
    statement: z.string().default("")
})

/**
 * Creates a new obstacle and returns its id
 */
export default defineEventHandler(async (event) => {
    const { name, statement, solutionId } = await validateEventBody(event, bodySchema),
        { solution, sessionUser } = await assertSolutionContributor(event, solutionId),
        em = fork()

    const newOutcome = new Outcome({
        name,
        statement,
        solution,
        modifiedBy: sessionUser,
        lastModified: new Date()
    })

    await em.persistAndFlush(newOutcome)

    return newOutcome.id
})