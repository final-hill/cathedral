import { z } from "zod"
import { fork } from "~/server/data/orm"
import AppUser from "~/server/domain/application/AppUser"
import { getServerSession } from "#auth"

const bodySchema = z.object({
    isSystemAdmin: z.boolean()
})

/**
 * PUT /api/appusers/:id
 *
 * Updates an appuser by id.
 */
export default defineEventHandler(async (event) => {
    const id = event.context.params?.id

    if (!id)
        throw createError({
            statusCode: 400,
            statusMessage: "Bad Request: id is required."
        })

    const em = fork(),
        [body, session, appUser] = await Promise.all([
            readValidatedBody(event, (b) => bodySchema.safeParse(b)),
            getServerSession(event),
            em.findOne(AppUser, { id })
        ]),
        sessionUser = (await em.findOne(AppUser, { id: session!.id }))!

    if (!body.success)
        throw createError({
            statusCode: 400,
            statusMessage: "Bad Request: Invalid body parameters",
            message: JSON.stringify(body.error.errors)
        })
    if (!appUser)
        throw createError({
            statusCode: 400,
            statusMessage: `Bad Request: No appuser found with id: ${id}`
        })
    if (!sessionUser.isSystemAdmin)
        throw createError({
            statusCode: 403,
            statusMessage: "Forbidden: You must be a system admin to update a user."
        })

    appUser.isSystemAdmin = body.data.isSystemAdmin

    await em.flush()
})