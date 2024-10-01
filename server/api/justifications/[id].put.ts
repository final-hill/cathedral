import { fork } from "~/server/data/orm"
import { z } from "zod"
import { Justification } from "~/server/domain/requirements/index.js"

const paramSchema = z.object({
    id: z.string().uuid()
})

const bodySchema = z.object({
    solutionId: z.string().uuid(),
    name: z.string().default("{Untitled Justification}"),
    statement: z.string().default(""),
    isSilence: z.boolean().optional()
})

/**
 * Updates a Justification by id.
 */
export default defineEventHandler(async (event) => {
    const { id } = await validateEventParams(event, paramSchema),
        { solutionId } = await validateEventBody(event, bodySchema),
        { sessionUser } = await assertSolutionContributor(event, solutionId),
        { name, statement, isSilence } = await validateEventBody(event, bodySchema),
        em = fork(),
        justification = await em.findOne(Justification, id)

    if (!justification)
        throw createError({
            statusCode: 400,
            statusMessage: `Bad Request: No assumption found with id: ${id}`
        })

    Object.assign(justification, {
        name,
        statement,
        modifiedBy: sessionUser,
        lastModified: new Date(),
        ...(isSilence !== undefined && { isSilence })
    })

    await em.flush()
})