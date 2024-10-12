import { fork } from "~/server/data/orm.js"
import { z } from "zod"
import { Assumption } from "~/server/domain/index.js"

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
 * Updates an assumption by id.
 */
export default defineEventHandler(async (event) => {
    const { id } = await validateEventParams(event, paramSchema),
        { name, statement, solutionId, isSilence } = await validateEventBody(event, bodySchema),
        { sessionUser } = await assertSolutionContributor(event, solutionId),
        em = fork(),
        assumption = await em.findOne(Assumption, id)

    if (!assumption)
        throw createError({
            statusCode: 400,
            statusMessage: `Bad Request: No assumption found with id: ${id}`
        })

    Object.assign(assumption, {
        name: name ?? assumption.name,
        statement: statement ?? assumption.statement,
        isSilence: isSilence ?? assumption.isSilence,
        modifiedBy: sessionUser,
        lastModified: new Date()
    })

    await em.persistAndFlush(assumption)
})