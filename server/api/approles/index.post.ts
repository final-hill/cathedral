import { z } from "zod"
import { fork } from "~/server/data/orm"
import AppRole from "~/server/domain/application/AppRole"
import { getServerSession } from '#auth'

const bodySchema = z.object({
    name: z.string().min(1),
})

/**
 * POST /api/approles
 *
 * Creates a new approle and returns its id
 */
export default defineEventHandler(async (event) => {
    const body = await readValidatedBody(event, (b) => bodySchema.safeParse(b)),
        session = (await getServerSession(event))!,
        em = fork()

    if (!body.success)
        throw createError({
            statusCode: 400,
            statusMessage: 'Bad Request: Invalid body parameters',
            message: JSON.stringify(body.error.errors)
        })

    // check if the user is a system admin before creating the role
    if (!session?.user?.isSystemAdmin)
        throw createError({
            statusCode: 403,
            statusMessage: "Forbidden: You must be a system admin to create a role"
        })

    const newAppUser = new AppRole({
        name: body.data.name
    })

    await em.persistAndFlush(newAppUser)

    return newAppUser.name
})