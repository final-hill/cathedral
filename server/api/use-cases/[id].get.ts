import { z } from "zod"
import { fork } from "~/server/data/orm"
import { UseCase } from "~/server/domain/requirements/index.js"

const paramSchema = z.object({
    id: z.string().uuid()
})

const querySchema = z.object({
    solutionId: z.string().uuid()
})

/**
 * Returns a UseCase by id
 */
export default defineEventHandler(async (event) => {
    const { id } = await validateEventParams(event, paramSchema),
        { solutionId } = await validateEventQuery(event, querySchema),
        em = fork()

    await assertSolutionReader(event, solutionId)

    const result = await em.findOne(UseCase, id, { populate: ['modifiedBy', 'solution', 'precondition', 'successGuarantee'] })

    if (!result)
        throw createError({
            statusCode: 404,
            statusMessage: `Item not found with the given id: ${id}`
        })

    return result
})