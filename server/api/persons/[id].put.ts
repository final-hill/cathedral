import { z } from "zod"
import { fork } from "~/server/data/orm"
import { Person } from "~/server/domain/requirements/index.js"

const paramSchema = z.object({
    id: z.string().uuid()
})

const bodySchema = z.object({
    solutionId: z.string().uuid(),
    name: z.string().default("{Untitled Person}"),
    statement: z.string().default(""),
    email: z.string().email().optional()
})

/**
 * Updates a person by id.
 */
export default defineEventHandler(async (event) => {
    const { id } = await validateEventParams(event, paramSchema),
        { email, name, statement, solutionId } = await validateEventBody(event, bodySchema),
        { sessionUser } = await assertSolutionContributor(event, solutionId),
        em = fork()

    const person = await em.findOne(Person, id)

    if (!person)
        throw createError({
            statusCode: 400,
            statusMessage: `Bad Request: No assumption found with id: ${id}`
        })

    person.name = name
    person.statement = statement
    person.email = email
    person.modifiedBy = sessionUser

    await em.flush()
})