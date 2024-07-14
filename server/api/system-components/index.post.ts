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
 * POST /api/system-components
 *
 * Creates a new system-component and returns its id
 */
export default defineEventHandler(async (event) => {
    const systemComponentInteractor = new SystemComponentInteractor(
        new SystemComponentRepository()
    ),
        body = await readValidatedBody(event, (b) => bodySchema.safeParse(b))

    if (!body.success)
        throw createError({
            statusCode: 400,
            statusMessage: "Bad Request: Invalid body parameters"
        })

    return systemComponentInteractor.create({
        name: body.data.name,
        statement: body.data.statement,
        solutionId: body.data.solutionId as Uuid,
        parentComponentId: body.data.parentComponentId as Uuid
    })
})