import { z } from "zod"
import { fork } from "~/server/data/orm"
import { Limit } from "~/server/domain/requirements/index.js"

const paramSchema = z.object({
    id: z.string().uuid()
})

const bodySchema = z.object({
    solutionId: z.string().uuid(),
    name: z.string().default("{Untitled Limit}"),
    statement: z.string().default("")
})

/**
 * Updates a limit by id.
 */
export default defineEventHandler(async (event) => {
    const { id } = await validateEventParams(event, paramSchema),
        { name, statement, solutionId } = await validateEventBody(event, bodySchema),
        { sessionUser } = await assertSolutionContributor(event, solutionId),
        em = fork()

    const limit = await em.findOne(Limit, id)

    if (!limit)
        throw createError({
            statusCode: 400,
            statusMessage: `Bad Request: No assumption found with id: ${id}`
        })

    limit.name = name
    limit.statement = statement
    limit.modifiedBy = sessionUser

    await em.flush()
})