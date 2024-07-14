import { type Uuid } from "~/server/domain/Uuid"
import { z } from "zod"
import PersonRepository from "~/server/data/repositories/PersonRepository"
import PersonInteractor from "~/server/application/PersonInteractor"

const bodySchema = z.object({
    name: z.string(),
    statement: z.string(),
    solutionId: z.string(),
    email: z.string().email()
})

/**
 * Creates a new person and returns its id
 */
export default defineEventHandler(async (event) => {
    const personInteractor = new PersonInteractor(new PersonRepository()),
        body = await readValidatedBody(event, (b) => bodySchema.safeParse(b))

    if (!body.success)
        throw createError({
            statusCode: 400,
            statusMessage: "Bad Request: Invalid body parameters"
        })

    return personInteractor.create({
        name: body.data.name,
        statement: body.data.statement,
        solutionId: body.data.solutionId as Uuid,
        email: body.data.email
    })
})