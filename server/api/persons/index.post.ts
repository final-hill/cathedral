import { z } from "zod"
import { fork } from "~/server/data/orm"
import Solution from "~/server/domain/application/Solution"
import { Person } from "~/server/domain/requirements/index"

const bodySchema = z.object({
    name: z.string(),
    statement: z.string(),
    solutionId: z.string().uuid(),
    email: z.string().email()
})

/**
 * Creates a new person and returns its id
 */
export default defineEventHandler(async (event) => {
    const body = await readValidatedBody(event, (b) => bodySchema.safeParse(b)),
        em = fork()

    if (!body.success)
        throw createError({
            statusCode: 400,
            statusMessage: 'Bad Request: Invalid body parameters',
            message: JSON.stringify(body.error.errors)
        })

    const solution = await em.findOne(Solution, body.data.solutionId)

    if (!solution)
        throw createError({
            statusCode: 400,
            statusMessage: `Bad Request: Solution not found for id ${body.data.solutionId}`
        })

    const newPerson = new Person({
        name: body.data.name,
        statement: body.data.statement,
        solution,
        email: body.data.email
    })

    await em.persistAndFlush(newPerson)

    return newPerson.id
})