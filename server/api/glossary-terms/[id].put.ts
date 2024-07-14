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
 * PUT /api/glossary-terms/:id
 *
 * Updates a glossary term by id.
 */
export default defineEventHandler(async (event) => {
    const id = event.context.params?.id,
        glossaryTermInteractor = new GlossaryTermInteractor(new GlossaryTermRepository()),
        body = await readValidatedBody(event, (b) => bodySchema.safeParse(b))

    if (!body.success)
        throw createError({
            statusCode: 400,
            statusMessage: "Bad Request: Invalid body parameters"
        })

    if (id) {
        return glossaryTermInteractor.update({
            id: id as Uuid,
            name: body.data.name,
            statement: body.data.statement,
            solutionId: body.data.solutionId as Uuid,
            // future use as part of Topic Maps?
            parentComponentId: null
        })
    } else {
        throw createError({
            statusCode: 400,
            statusMessage: "Bad Request: id is required."
        })
    }
})