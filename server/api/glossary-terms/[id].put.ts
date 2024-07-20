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
 * PUT /api/glossary-terms/:id
 *
 * Updates a glossary term by id.
 */
export default defineEventHandler(async (event) => {
    const id = event.context.params?.id,
        body = await readValidatedBody(event, (b) => bodySchema.safeParse(b))

    if (!body.success)
        throw createError({
            statusCode: 400,
            statusMessage: "Bad Request: Invalid body parameters"
        })

    if (id) {
        const glossaryTerm = await orm.em.findOne(GlossaryTerm, id),
            solution = await orm.em.findOne(Solution, body.data.solutionId)

        if (!glossaryTerm)
            throw createError({
                statusCode: 400,
                statusMessage: `Bad Request: No effect found with id: ${id}`
            })
        if (!solution)
            throw createError({
                statusCode: 400,
                statusMessage: `Bad Request: No solution found with id: ${body.data.solutionId}`
            })

        glossaryTerm.name = body.data.name
        glossaryTerm.statement = body.data.statement
        glossaryTerm.solution = solution
        // TODO: future use as part of Topic Maps?
        glossaryTerm.parentComponent = undefined

        await orm.em.flush()
    } else {
        throw createError({
            statusCode: 400,
            statusMessage: "Bad Request: id is required."
        })
    }
})