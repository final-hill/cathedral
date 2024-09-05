import { z } from "zod"
import { fork } from "~/server/data/orm"
import { Invariant } from "~/server/domain/requirements/index.js"

const paramSchema = z.object({
    id: z.string().uuid()
})

const bodySchema = z.object({
    solutionId: z.string().uuid(),
    name: z.string().min(1),
    statement: z.string()
})

/**
 * Updates an invariant by id.
 */
export default defineEventHandler(async (event) => {
    const { id } = await validateEventParams(event, paramSchema),
        { name, statement, solutionId } = await validateEventBody(event, bodySchema),
        { sessionUser } = await assertSolutionContributor(event, solutionId),
        em = fork()

    const invariant = await em.findOne(Invariant, id)

    if (!invariant)
        throw createError({
            statusCode: 400,
            statusMessage: `Bad Request: No effect found with id: ${id}`
        })

    invariant.name = name
    invariant.statement = statement
    invariant.modifiedBy = sessionUser

    await em.flush()
})