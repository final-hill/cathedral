import { fork } from "~/server/data/orm.js"
import { z } from "zod"
import { Assumption } from "~/server/domain/index.js"

const bodySchema = z.object({
    solutionId: z.string().uuid(),
    name: z.string().default("{Untitled Assumption}"),
    statement: z.string().default(""),
    isSilence: z.boolean().default(false)
})

/**
 * Creates a new assumption and returns its id
 */
export default defineEventHandler(async (event) => {
    const { name, statement, solutionId, isSilence } = await validateEventBody(event, bodySchema),
        { solution, sessionUser } = await assertSolutionContributor(event, solutionId),
        em = fork()

    const newAssumption = new Assumption({
        name,
        statement,
        solution,
        modifiedBy: sessionUser,
        lastModified: new Date(),
        isSilence
    })

    await em.persistAndFlush(newAssumption)

    return newAssumption.id
})