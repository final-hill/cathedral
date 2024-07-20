import { z } from "zod"
import orm from "~/server/data/orm"
import Solution from "~/server/domain/Solution"
import Person from "~/server/domain/Person"

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
    const body = await readValidatedBody(event, (b) => bodySchema.safeParse(b))

    if (!body.success)
        throw createError({
            statusCode: 400,
            statusMessage: "Bad Request: Invalid body parameters"
        })

    const solution = await orm.em.findOne(Solution, body.data.solutionId)

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

    await orm.em.persistAndFlush(newPerson)
})