import { z } from "zod"
import { fork } from "~/server/data/orm.js"
import { Person } from "~/server/domain/index.js"

const bodySchema = z.object({
    solutionId: z.string().uuid(),
    name: z.string().default("{Anonymous Person}"),
    statement: z.string().default(""),
    email: z.string().email().optional(),
    isSilence: z.boolean().default(false)
})

/**
 * Creates a new person and returns its id
 */
export default defineEventHandler(async (event) => {
    const { email, name, statement, solutionId, isSilence } = await validateEventBody(event, bodySchema),
        { solution, sessionUser } = await assertSolutionContributor(event, solutionId),
        em = fork()

    const newPerson = new Person({
        name,
        statement,
        solution,
        email,
        modifiedBy: sessionUser,
        lastModified: new Date(),
        isSilence
    })

    await em.persistAndFlush(newPerson)

    return newPerson.id
})