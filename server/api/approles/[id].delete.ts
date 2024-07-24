import { fork } from "~/server/data/orm"
import AppRole from "~/server/domain/application/AppRole"
import { getServerSession } from "#auth"
import AppUser from "~/server/domain/application/AppUser"

/**
 * Delete an approle by id.
 */
export default defineEventHandler(async (event) => {
    const id = event.context.params?.id,
        session = (await getServerSession(event))!,
        em = fork()

    // check if the user is a system admin before deleting the role
    const sessionUser = await em.findOne(AppUser, { id: session.id })
    if (!sessionUser?.isSystemAdmin)
        throw createError({
            statusCode: 403,
            statusMessage: "Forbidden: You must be a system admin to delete a role"
        })

    if (id) {
        em.remove(em.getReference(AppRole, { name: id }))
        await em.flush()
    } else {
        throw createError({
            statusCode: 400,
            statusMessage: "Bad Request: id is required."
        })
    }
})
