import { fork } from "~/server/data/orm"
import { z } from "zod"
import { Effect } from "~/server/domain/requirements/index.js"

const paramSchema = z.object({
    id: z.string().uuid()
})

const bodySchema = z.object({
    solutionId: z.string().uuid(),
    name: z.string().min(1),
    statement: z.string()
})

/**
 * Updates an effect by id.
 */
export default defineEventHandler(async (event) => {
    const { id } = await validateEventParams(event, paramSchema),
        { name, statement, solutionId } = await validateEventBody(event, bodySchema),
        { sessionUser } = await assertSolutionContributor(event, solutionId),
        em = fork()

    const effect = await em.findOne(Effect, id)

    if (!effect)
        throw createError({
            statusCode: 400,
            statusMessage: `Bad Request: No effect found with id: ${id}`
        })

    effect.name = name
    effect.statement = statement
    effect.modifiedBy = sessionUser

    await em.flush()
})