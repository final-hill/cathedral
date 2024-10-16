import { z } from "zod"
import { fork } from "~/server/data/orm.js"
import { Person } from "~/server/domain/index.js"

const paramSchema = z.object({
    id: z.string().uuid()
})

const bodySchema = z.object({
    solutionId: z.string().uuid(),
    name: z.string().optional(),
    statement: z.string().optional(),
    email: z.string().email().optional(),
    isSilence: z.boolean().optional()
})

/**
 * Updates a person by id.
 */
export default defineEventHandler(async (event) => {
    const { id } = await validateEventParams(event, paramSchema),
        { email, name, statement, solutionId, isSilence } = await validateEventBody(event, bodySchema),
        { sessionUser } = await assertSolutionContributor(event, solutionId),
        em = fork(),
        person = await em.findOne(Person, id)

    if (!person)
        throw createError({
            statusCode: 400,
            statusMessage: `Bad Request: No assumption found with id: ${id}`
        })

    Object.assign(person, {
        name: name ?? person.name,
        statement: statement ?? person.statement,
        email: email ?? person.email,
        isSilence: isSilence ?? person.isSilence,
        modifiedBy: sessionUser,
        lastModified: new Date()
    })

    await em.persistAndFlush(person)
})