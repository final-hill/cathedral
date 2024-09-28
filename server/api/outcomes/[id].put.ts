import { z } from "zod"
import { fork } from "~/server/data/orm"
import { Outcome } from "~/server/domain/requirements/index.js"

const paramSchema = z.object({
    id: z.string().uuid()
})

const bodySchema = z.object({
    solutionId: z.string().uuid(),
    name: z.string().default("{Untitled Outcome}"),
    statement: z.string().default("")
})

/**
 * Updates an outcome by id.
 */
export default defineEventHandler(async (event) => {
    const { id } = await validateEventParams(event, paramSchema),
        { name, statement, solutionId } = await validateEventBody(event, bodySchema),
        { sessionUser } = await assertSolutionContributor(event, solutionId),
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