import { fork } from "~/server/data/orm.js"
import { z } from "zod"
import { Effect } from "~/server/domain/index.js"

const paramSchema = z.object({
    id: z.string().uuid()
})

const bodySchema = z.object({
    solutionId: z.string().uuid(),
    name: z.string().optional(),
    statement: z.string().optional(),
    isSilence: z.boolean().optional()
})

/**
 * Updates an effect by id.
 */
export default defineEventHandler(async (event) => {
    const { id } = await validateEventParams(event, paramSchema),
        { name, statement, solutionId, isSilence } = await validateEventBody(event, bodySchema),
        { sessionUser } = await assertSolutionContributor(event, solutionId),
        em = fork(),
        effect = await em.findOne(Effect, id)

    if (!effect)
        throw createError({
            statusCode: 400,
            statusMessage: `Bad Request: No effect found with id: ${id}`
        })

    Object.assign(effect, {
        name: name ?? effect.name,
        isSilence: isSilence ?? effect.isSilence,
        statement: statement ?? effect.statement,
        modifiedBy: sessionUser,
        lastModified: new Date(),
    })

    await em.persistAndFlush(effect)
})