import { z } from "zod"
import PersonRepository from "~/server/data/repositories/PersonRepository"
import PersonInteractor from "~/server/application/PersonInteractor"

const querySchema = z.object({
    name: z.string().optional(),
    statement: z.string().optional(),
    solutionId: z.string().uuid().optional(),
    email: z.string().email().optional()
})

/**
 * Returns all persons that match the query parameters
 */
export default defineEventHandler(async (event) => {
    const personInteractor = new PersonInteractor(new PersonRepository()),
        query = await getValidatedQuery(event, (q) => querySchema.safeParse(q))

    if (!query.success)
        throw createError({
            statusCode: 400,
            statusMessage: "Bad Request: Invalid query parameters"
        })

    return personInteractor.getAll(
        Object.fromEntries(
            Object.entries(query.data)
                .filter(([_, v]) => v !== undefined)
        )
    )
})
