import { z } from "zod"
import orm from "~/server/data/orm"
import Person from "~/server/domain/Person"
import Solution from "~/server/domain/Solution"

const bodySchema = z.object({
    name: z.string(),
    statement: z.string(),
    solutionId: z.string().uuid(),
    email: z.string().email()
})

/**
 * Updates a person by id.
 */
export default defineEventHandler(async (event) => {
    const id = event.context.params?.id,
        body = await readValidatedBody(event, (b) => bodySchema.safeParse(b))

    if (!body.success)
        throw createError({
            statusCode: 400,
            statusMessage: "Bad Request: Invalid body parameters"
        })

    if (id) {
        const person = await orm.em.findOne(Person, id),
            solution = await orm.em.findOne(Solution, body.data.solutionId)

        if (!person)
            throw createError({
                statusCode: 400,
                statusMessage: `Bad Request: No assumption found with id: ${id}`
            })
        if (!solution)
            throw createError({
                statusCode: 400,
                statusMessage: `Bad Request: No solution found with id: ${body.data.solutionId}`
            })

        person.name = body.data.name
        person.statement = body.data.statement
        person.solution = solution
        person.email = body.data.email

        await orm.em.flush()
    } else {
        throw createError({
            statusCode: 400,
            statusMessage: "Bad Request: id is required."
        })
    }
})