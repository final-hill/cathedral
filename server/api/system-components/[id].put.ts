import { type Uuid } from "~/server/domain/Uuid"
import { z } from "zod"
import SystemComponentInteractor from "~/server/application/SystemComponentInteractor"
import SystemComponentRepository from "~/server/data/repositories/SystemComponentRepository"

const bodySchema = z.object({
    name: z.string(),
    statement: z.string(),
    solutionId: z.string().uuid(),
    parentComponentId: z.string().uuid()
})

/**
 * Updates an environment component by id.
 */
export default defineEventHandler(async (event) => {
    const id = event.context.params?.id,
        systemComponentInteractor = new SystemComponentInteractor(
            new SystemComponentRepository()
        ),
        body = await readValidatedBody(event, (b) => bodySchema.safeParse(b))

    if (!body.success)
        throw createError({
            statusCode: 400,
            statusMessage: "Bad Request: Invalid body parameters"
        })

    if (id) {
        return systemComponentInteractor.update({
            id: id as Uuid,
            name: body.data.name,
            statement: body.data.statement,
            solutionId: body.data.solutionId as Uuid,
            parentComponentId: body.data.parentComponentId as Uuid
        })
    } else {
        throw createError({
            statusCode: 400,
            statusMessage: "Bad Request: id is required."
        })
    }
})