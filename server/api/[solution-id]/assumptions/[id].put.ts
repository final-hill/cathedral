import { fork } from "~/server/data/orm"
import { z } from "zod"
import { Assumption } from "~/server/domain/requirements/index.js"

const paramSchema = z.object({
    solutionId: z.string().uuid(),
    id: z.string().uuid()
})

const bodySchema = z.object({
    name: z.string().min(1),
    statement: z.string()
})

/**
 * PUT /api/assumptions/:id
 *
 * Updates an assumption by id.
 */
export default defineEventHandler(async (event) => {
    const { id, solutionId } = await validateEventParams(event, paramSchema),
        { name, statement } = await validateEventBody(event, bodySchema),
        { sessionUser } = await assertSolutionContributor(event, solutionId),
        em = fork()

    const assumption = await em.findOne(Assumption, id)

    if (!assumption)
        throw createError({
            statusCode: 400,
            statusMessage: `Bad Request: No assumption found with id: ${id}`
        })

    assumption.name = name
    assumption.statement = statement
    assumption.modifiedBy = sessionUser

    await em.flush()
})