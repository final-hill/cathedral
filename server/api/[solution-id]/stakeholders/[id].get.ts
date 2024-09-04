import { z } from "zod"
import { fork } from "~/server/data/orm"
import { Stakeholder } from "~/server/domain/requirements/index.js"

const paramSchema = z.object({
    solutionId: z.string().uuid(),
    id: z.string().uuid()
})

/**
 * Returns a stakeholder by id
 */
export default defineEventHandler(async (event) => {
    const { id, solutionId } = await validateEventParams(event, paramSchema),
        em = fork()

    await assertSolutionReader(event, solutionId)

    const result = await em.findOne(Stakeholder, id)

    if (!result)
        throw createError({
            statusCode: 404,
            statusMessage: `Item not found with the given id: ${id}`
        })

    return result
})