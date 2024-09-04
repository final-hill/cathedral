import { z } from "zod"
import { fork } from "~/server/data/orm"
import { Person } from "~/server/domain/requirements/index.js"

const paramSchema = z.object({
    solutionId: z.string().uuid()
})

const bodySchema = z.object({
    name: z.string(),
    statement: z.string(),
    email: z.string().email()
})

/**
 * Creates a new person and returns its id
 */
export default defineEventHandler(async (event) => {
    const { solutionId } = await validateEventParams(event, paramSchema),
        { email, name, statement } = await validateEventBody(event, bodySchema),
        { solution, sessionUser } = await assertSolutionContributor(event, solutionId),
        em = fork()

    const newPerson = new Person({
        name,
        statement,
        solution,
        email,
        modifiedBy: sessionUser,
        lastModified: new Date()
    })

    await em.persistAndFlush(newPerson)

    return newPerson.id
})