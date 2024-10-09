import { z } from "zod"
import { fork } from "~/server/data/orm.js"
import { Outcome } from "~/server/domain/index.js"

const paramSchema = z.object({
    id: z.string().uuid()
})

const bodySchema = z.object({
    solutionId: z.string().uuid(),
    name: z.string().default("{Untitled Outcome}"),
    statement: z.string().default(""),
    isSilence: z.boolean().optional()
})

/**
 * Updates an outcome by id.
 */
export default defineEventHandler(async (event) => {
    const { id } = await validateEventParams(event, paramSchema),
        { name, statement, solutionId, isSilence } = await validateEventBody(event, bodySchema),
        { sessionUser } = await assertSolutionContributor(event, solutionId),
        em = fork(),
        outcome = await em.findOne(Outcome, id)

    if (!outcome)
        throw createError({
            statusCode: 400,
            statusMessage: `Bad Request: No assumption found with id: ${id}`
        })

    Object.assign(outcome, {
        name,
        statement,
        modifiedBy: sessionUser,
        lastModified: new Date(),
        ...(isSilence !== undefined && { isSilence })
    })

    await em.persistAndFlush(outcome)
})