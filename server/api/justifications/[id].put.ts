import { fork } from "~/server/data/orm.js"
import { z } from "zod"
import { Justification } from "~/server/domain/index.js"

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
        name: name ?? justification.name,
        statement: statement ?? justification.statement,
        isSilence: isSilence ?? justification.isSilence,
        modifiedBy: sessionUser,
        lastModified: new Date()
    })

    await em.persistAndFlush(justification)
})