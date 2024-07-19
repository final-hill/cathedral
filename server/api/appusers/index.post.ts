import { type Uuid } from "~/server/domain/Uuid"
import { z } from "zod"
import AppUserRepository from "~/server/data/repositories/AppUserRepository"
import AppUserInteractor from "~/server/application/AppUserInteractor"

const bodySchema = z.object({
    id: z.string().email(),
    defaultOrganizationId: z.string().uuid(),
    creationDate: z.date()
})

/**
 * POST /api/appusers
 *
 * Creates a new appuser and returns its id
 */
export default defineEventHandler(async (event) => {
    const appUserInteractor = new AppUserInteractor(new AppUserRepository()),
        body = await readValidatedBody(event, (b) => bodySchema.safeParse(b))

    if (!body.success)
        throw createError({
            statusCode: 400,
            statusMessage: "Bad Request: Invalid body parameters"
        })

    return appUserInteractor.create({
        id: body.data.id,
        defaultOrganizationId: body.data.defaultOrganizationId as Uuid,
        creationDate: body.data.creationDate
    })
})