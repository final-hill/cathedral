import { z } from "zod"
import orm from "~/server/data/orm"
import GlossaryTerm from "~/server/domain/GlossaryTerm.js"
import Solution from "~/server/domain/Solution.js"

const bodySchema = z.object({
    name: z.string().min(1),
    statement: z.string().min(0),
    solutionId: z.string().uuid()
})

/**
 * POST /api/glossary-terms
 *
 * Creates a new glossary term and returns its id
 */
export default defineEventHandler(async (event) => {
    const body = await readValidatedBody(event, (b) => bodySchema.safeParse(b))

    if (!body.success)
        throw createError({
            statusCode: 400,
            statusMessage: "Bad Request: Invalid body parameters"
        })

    const solution = await orm.em.findOne(Solution, body.data.solutionId)

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

    await orm.em.persistAndFlush(glossaryTerm)
})