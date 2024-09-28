import { z } from "zod"
import { fork } from "~/server/data/orm"
import { GlossaryTerm } from "~/server/domain/requirements/index.js"

const paramSchema = z.object({
    id: z.string().uuid()
})

const bodySchema = z.object({
    solutionId: z.string().uuid(),
    name: z.string().default("{Untitled Glossary Term}"),
    statement: z.string().default("")
})

/**
 * Updates a glossary term by id.
 */
export default defineEventHandler(async (event) => {
    const { id } = await validateEventParams(event, paramSchema),
        { name, statement, solutionId } = await validateEventBody(event, bodySchema),
        { sessionUser } = await assertSolutionContributor(event, solutionId),
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