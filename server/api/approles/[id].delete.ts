import { fork } from "~/server/data/orm"
import AppRole from "~/server/domain/application/AppRole"
import { getServerSession } from '#auth'

/**
 * Delete an approle by id.
 */
export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig(),
        id = event.context.params?.id,
        session = (await getServerSession(event))!,
        em = fork()

    // check if the user is a system admin before deleting the role
    if (!session.user.isSystemAdmin)
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
