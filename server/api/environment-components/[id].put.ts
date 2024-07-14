import { type Uuid } from "~/server/domain/Uuid"
import { z } from "zod"
import EnvironmentComponentInteractor from "~/server/application/EnvironmentComponentInteractor"
import EnvironmentComponentRepository from "~/server/data/repositories/EnvironmentComponentRepository"

const bodySchema = z.object({
    name: z.string(),
    statement: z.string(),
    solutionId: z.string().uuid()
})

/**
 * PUT /api/environment-components/:id
 *
 * Updates an assumption by id.
 */
export default defineEventHandler(async (event) => {
    const id = event.context.params?.id,
        environmentComponentInteractor = new EnvironmentComponentInteractor(
            new EnvironmentComponentRepository()
        ),
        body = await readValidatedBody(event, (b) => bodySchema.safeParse(b))

    if (!body.success)
        throw createError({
            statusCode: 400,
            statusMessage: "Bad Request: Invalid body parameters"
        })

    if (id) {
        return environmentComponentInteractor.update({
            id: id as Uuid,
            name: body.data.name,
            statement: body.data.statement,
            solutionId: body.data.solutionId as Uuid,
            parentComponentId: null
        })
    } else {
        throw createError({
            statusCode: 400,
            statusMessage: "Bad Request: id is required."
        })
    }
})