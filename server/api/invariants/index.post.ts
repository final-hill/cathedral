import { z } from "zod"
import { fork } from "~/server/data/orm"
import { Invariant } from "~/server/domain/requirements/index.js"

const bodySchema = z.object({
    solutionId: z.string().uuid(),
    name: z.string().default("{Untitled Invariant}"),
    statement: z.string().default("")
})

/**
 * Creates a new invariant and returns its id
 */
export default defineEventHandler(async (event) => {
    const { name, statement, solutionId } = await validateEventBody(event, bodySchema),
        { solution, sessionUser } = await assertSolutionContributor(event, solutionId),
        em = fork()

    const invariant = new Invariant({
        name,
        statement,
        solution,
        modifiedBy: sessionUser,
        lastModified: new Date()
    })

    await em.persistAndFlush(invariant)

    return invariant.id
})