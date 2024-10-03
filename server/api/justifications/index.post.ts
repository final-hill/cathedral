import { fork } from "~/server/data/orm.js"
import { z } from "zod"
import { Justification } from "~/server/domain/index.js"

const bodySchema = z.object({
    solutionId: z.string().uuid(),
    name: z.string().default("{Untitled Justification}"),
    statement: z.string().default(""),
    isSilence: z.boolean().default(false)
})

/**
 * Creates a new justifications and returns its id
 */
export default defineEventHandler(async (event) => {
    const { name, statement, solutionId, isSilence } = await validateEventBody(event, bodySchema),
        { solution, sessionUser } = await assertSolutionContributor(event, solutionId),
        em = fork()

    const newJustification = new Justification({
        name,
        statement,
        solution,
        modifiedBy: sessionUser,
        lastModified: new Date(),
        isSilence
    })

    await em.persistAndFlush(newJustification)

    return newJustification.id
})