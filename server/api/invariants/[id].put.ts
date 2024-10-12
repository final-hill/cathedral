import { z } from "zod"
import { fork } from "~/server/data/orm.js"
import { Invariant } from "~/server/domain/index.js"

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
 * Updates an invariant by id.
 */
export default defineEventHandler(async (event) => {
    const { id } = await validateEventParams(event, paramSchema),
        { name, statement, solutionId, isSilence } = await validateEventBody(event, bodySchema),
        { sessionUser } = await assertSolutionContributor(event, solutionId),
        em = fork(),
        invariant = await em.findOne(Invariant, id)

    if (!invariant)
        throw createError({
            statusCode: 400,
            statusMessage: `Bad Request: No effect found with id: ${id}`
        })

    Object.assign(invariant, {
        name: name ?? invariant.name,
        statement: statement ?? invariant.statement,
        isSilence: isSilence ?? invariant.isSilence,
        modifiedBy: sessionUser,
        lastModified: new Date()
    })

    await em.persistAndFlush(invariant)
})