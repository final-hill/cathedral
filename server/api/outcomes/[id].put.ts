import { type Uuid } from "~/server/domain/Uuid"
import { z } from "zod"
import OutcomeRepository from "~/server/data/repositories/OutcomeRepository"
import OutcomeInteractor from "~/server/application/OutcomeInteractor"

const bodySchema = z.object({
    name: z.string(),
    statement: z.string(),
    solutionId: z.string()
})

/**
 * Updates an outcome by id.
 */
export default defineEventHandler(async (event) => {
    const id = event.context.params?.id,
        outcomeInteractor = new OutcomeInteractor(new OutcomeRepository()),
        body = await readValidatedBody(event, (b) => bodySchema.safeParse(b))

    if (!body.success)
        throw createError({
            statusCode: 400,
            statusMessage: "Bad Request: Invalid body parameters"
        })

    if (id) {
        return outcomeInteractor.update({
            id: id as Uuid,
            name: body.data.name,
            statement: body.data.statement,
            solutionId: body.data.solutionId as Uuid
        })
    } else {
        throw createError({
            statusCode: 400,
            statusMessage: "Bad Request: id is required."
        })
    }
})