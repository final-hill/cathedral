import { z } from "zod"
import { fork } from "~/server/data/orm"
import GlossaryTerm from "~/server/domain/GlossaryTerm.js"
import Solution from "~/server/domain/Solution.js"
import { type Uuid } from "~/server/domain/Uuid"

const bodySchema = z.object({
    name: z.string().min(1),
    statement: z.string(),
    solutionId: z.string().uuid()
})

/**
 * POST /api/glossary-terms
 *
 * Creates a new glossary term and returns its id
 */
export default defineEventHandler(async (event) => {
    const body = await readValidatedBody(event, (b) => bodySchema.safeParse(b)),
        em = fork()

    if (!body.success)
        throw createError({
            statusCode: 400,
            statusMessage: 'Bad Request: Invalid body parameters',
            message: JSON.stringify(body.error.errors)
        })

    const solution = await em.findOne(Solution, body.data.solutionId as Uuid)

    if (!solution)
        throw createError({
            statusCode: 400,
            statusMessage: `Bad Request: Solution not found for id ${body.data.solutionId}`
        })

    const glossaryTerm = new GlossaryTerm({
        name: body.data.name,
        statement: body.data.statement,
        solution,
        parentComponent: undefined
    })

    await em.persistAndFlush(glossaryTerm)

    return glossaryTerm.id
})