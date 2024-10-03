import { z } from "zod"
import { fork } from "~/server/data/orm.js"
import { GlossaryTerm } from "~/server/domain/index.js"

const bodySchema = z.object({
    solutionId: z.string().uuid(),
    name: z.string().default("{Untitled Glossary Term}"),
    statement: z.string().default(""),
    isSilence: z.boolean().default(false)
})

/**
 * Creates a new glossary term and returns its id
 */
export default defineEventHandler(async (event) => {
    const { name, statement, solutionId, isSilence } = await validateEventBody(event, bodySchema),
        { solution, sessionUser } = await assertSolutionContributor(event, solutionId),
        em = fork()

    const glossaryTerm = new GlossaryTerm({
        name,
        statement,
        solution,
        parentComponent: undefined,
        lastModified: new Date(),
        modifiedBy: sessionUser,
        isSilence
    })

    await em.persistAndFlush(glossaryTerm)

    return glossaryTerm.id
})