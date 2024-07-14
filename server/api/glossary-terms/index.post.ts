import { type Uuid, emptyUuid } from "~/server/domain/Uuid"
import { z } from "zod"
import GlossaryTermRepository from "~/server/data/repositories/GlossaryTermRepository"
import GlossaryTermInteractor from "~/server/application/GlossaryTermInteractor"

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
    const glossaryTermInteractor = new GlossaryTermInteractor(new GlossaryTermRepository()),
        body = await readValidatedBody(event, (b) => bodySchema.safeParse(b))

    if (!body.success)
        throw createError({
            statusCode: 400,
            statusMessage: "Bad Request: Invalid body parameters"
        })

    return glossaryTermInteractor.create({
        name: body.data.name,
        statement: body.data.statement,
        solutionId: body.data.solutionId as Uuid,
        parentComponentId: null
    })
})