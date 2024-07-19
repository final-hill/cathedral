import { type Uuid } from "~/server/domain/Uuid"
import { z } from "zod"
import AppUserInteractor from "~/server/application/AppUserInteractor"
import AppUserRepository from "~/server/data/repositories/AppUserRepository"

const bodySchema = z.object({
    defaultOrganizationId: z.string().uuid(),
    creationDate: z.date()
})

/**
 * PUT /api/appusers/:id
 *
 * Updates an assumption by id.
 */
export default defineEventHandler(async (event) => {
    const id = event.context.params?.id,
        appUserInteractor = new AppUserInteractor(new AppUserRepository()),
        body = await readValidatedBody(event, (b) => bodySchema.safeParse(b))

    if (!body.success)
        throw createError({
            statusCode: 400,
            statusMessage: "Bad Request: Invalid body parameters"
        })

    if (id) {
        return appUserInteractor.update({
            id: id,
            defaultOrganizationId: body.data.defaultOrganizationId as Uuid,
            creationDate: body.data.creationDate
        })
    } else {
        throw createError({
            statusCode: 400,
            statusMessage: "Bad Request: id is required."
        })
    }
})