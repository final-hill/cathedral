import { fork } from "~/server/data/orm"
import AppUser from "~/server/domain/application/AppUser"
import { getServerSession } from "#auth"

/**
 * Delete an appuser by id.
 */
export default defineEventHandler(async (event) => {
    const id = event.context.params?.id

    if (!id)
        throw createError({
            statusCode: 400,
            statusMessage: "Bad Request: id is required."
        })

    const em = fork(),
        session = (await getServerSession(event))!,
        appUser = (await em.findOne(AppUser, { id: session.id }))!

    // A user can only be deleted by a system admin
    if (!appUser.isSystemAdmin)
        throw createError({
            statusCode: 403,
            statusMessage: "Forbidden: You must be a system admin to delete a user."
        })

    em.remove(appUser)
    await em.flush()
})
