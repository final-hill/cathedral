import { z } from "zod"
import { fork } from "~/server/data/orm"
import { Outcome } from "~/server/domain/requirements/index.js"

const paramSchema = z.object({
    solutionId: z.string().uuid(),
    id: z.string().uuid()
})

const bodySchema = z.object({
    name: z.string(),
    statement: z.string()
})

/**
 * Updates an outcome by id.
 */
export default defineEventHandler(async (event) => {
    const { id, solutionId } = await validateEventParams(event, paramSchema),
        { sessionUser } = await assertSolutionContributor(event, solutionId),
        { name, statement } = await validateEventBody(event, bodySchema),
        em = fork()

    const outcome = await em.findOne(Outcome, id)

    if (!outcome)
        throw createError({
            statusCode: 400,
            statusMessage: `Bad Request: No assumption found with id: ${id}`
        })

    outcome.name = name
    outcome.statement = statement
    outcome.modifiedBy = sessionUser

    await em.flush()
})