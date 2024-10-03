import { z } from "zod"
import { fork } from "~/server/data/orm.js"
import { Limit } from "~/server/domain/index.js"

const bodySchema = z.object({
    solutionId: z.string().uuid(),
    name: z.string().default("{Untitled Limit}"),
    statement: z.string().default(""),
    isSilence: z.boolean().default(false)
})

/**
 * Creates a new limit and returns its id
 */
export default defineEventHandler(async (event) => {
    const { name, statement, solutionId, isSilence } = await validateEventBody(event, bodySchema),
        { solution, sessionUser } = await assertSolutionContributor(event, solutionId),
        em = fork()

    const newLimit = new Limit({
        name,
        statement,
        solution,
        modifiedBy: sessionUser,
        lastModified: new Date(),
        isSilence
    })

    await em.persistAndFlush(newLimit)

    return newLimit.id
})