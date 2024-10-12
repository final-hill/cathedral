import { z } from "zod"
import { fork } from "~/server/data/orm.js"
import { GlossaryTerm } from "~/server/domain/index.js"

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
 * Updates a glossary term by id.
 */
export default defineEventHandler(async (event) => {
    const { id } = await validateEventParams(event, paramSchema),
        { name, statement, solutionId, isSilence } = await validateEventBody(event, bodySchema),
        { sessionUser } = await assertSolutionContributor(event, solutionId),
        em = fork(),
        glossaryTerm = await em.findOne(GlossaryTerm, id)

    if (!glossaryTerm)
        throw createError({
            statusCode: 400,
            statusMessage: `Bad Request: No effect found with id: ${id}`
        })

    Object.assign(glossaryTerm, {
        name: name ?? glossaryTerm.name,
        statement: statement ?? glossaryTerm.statement,
        isSilence: isSilence ?? glossaryTerm.isSilence,
        // TODO: future use as part of Topic Maps?
        parentComponent: undefined,
        modifiedBy: sessionUser,
        lastModified: new Date()
    })

    await em.persistAndFlush(glossaryTerm)
})