import { z } from "zod"
import { fork } from "~/server/data/orm"
import { GlossaryTerm } from "~/server/domain/requirements/index.js"

const paramSchema = z.object({
    solutionId: z.string().uuid(),
    id: z.string().uuid()
})

const bodySchema = z.object({
    name: z.string().min(1),
    statement: z.string()
})

/**
 * Updates a glossary term by id.
 */
export default defineEventHandler(async (event) => {
    const { id, solutionId } = await validateEventParams(event, paramSchema),
        { sessionUser } = await assertSolutionContributor(event, solutionId),
        { name, statement } = await validateEventBody(event, bodySchema),
        em = fork()

    const glossaryTerm = await em.findOne(GlossaryTerm, id)

    if (!glossaryTerm)
        throw createError({
            statusCode: 400,
            statusMessage: `Bad Request: No effect found with id: ${id}`
        })

    glossaryTerm.name = name
    glossaryTerm.statement = statement
    // TODO: future use as part of Topic Maps?
    glossaryTerm.parentComponent = undefined
    glossaryTerm.modifiedBy = sessionUser

    await em.flush()
})