import { z } from "zod"
import { fork } from "~/server/data/orm"
import { GlossaryTerm } from "~/server/domain/requirements/index.js"

const paramSchema = z.object({
    solutionId: z.string().uuid()
})

const bodySchema = z.object({
    name: z.string().min(1),
    statement: z.string()
})

/**
 * Creates a new glossary term and returns its id
 */
export default defineEventHandler(async (event) => {
    const { solutionId } = await validateEventParams(event, paramSchema),
        { name, statement } = await validateEventBody(event, bodySchema),
        { solution, sessionUser } = await assertSolutionContributor(event, solutionId),
        em = fork()

    const glossaryTerm = new GlossaryTerm({
        name,
        statement,
        solution,
        parentComponent: undefined,
        lastModified: new Date(),
        modifiedBy: sessionUser
    })

    await em.persistAndFlush(glossaryTerm)

    return glossaryTerm.id
})