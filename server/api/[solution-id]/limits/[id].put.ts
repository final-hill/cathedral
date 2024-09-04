import { z } from "zod"
import { fork } from "~/server/data/orm"
import { Limit } from "~/server/domain/requirements/index.js"

const paramSchema = z.object({
    solutionId: z.string().uuid(),
    id: z.string().uuid()
})

const bodySchema = z.object({
    name: z.string(),
    statement: z.string()
})

/**
 * Updates a limit by id.
 */
export default defineEventHandler(async (event) => {
    const { id, solutionId } = await validateEventParams(event, paramSchema),
        { sessionUser } = await assertOrgContributor(event, solutionId),
        { name, statement } = await validateEventBody(event, bodySchema),
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