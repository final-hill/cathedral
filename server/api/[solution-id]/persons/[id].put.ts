import { z } from "zod"
import { fork } from "~/server/data/orm"
import { Person } from "~/server/domain/requirements/index.js"

const paramSchema = z.object({
    solutionId: z.string().uuid(),
    id: z.string().uuid()
})

const bodySchema = z.object({
    name: z.string(),
    statement: z.string(),
    email: z.string().email()
})

/**
 * Updates a person by id.
 */
export default defineEventHandler(async (event) => {
    const { id, solutionId } = await validateEventParams(event, paramSchema),
        { sessionUser } = await assertSolutionContributor(event, solutionId),
        { email, name, statement } = await validateEventBody(event, bodySchema),
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