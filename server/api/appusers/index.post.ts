import { z } from "zod"
import { fork } from "~/server/data/orm"
import AppUser from "~/server/domain/application/AppUser"
import { getServerSession } from "#auth"
import AppUserOrganizationRole from "~/server/domain/application/AppUserOrganizationRole"

const bodySchema = z.object({
    id: z.string().email(),
    organizationId: z.string().uuid(),
    isSystemAdmin: z.boolean()
})

/**
 * POST /api/appusers
 *
 * Creates a new appuser and returns its id
 */
export default defineEventHandler(async (event) => {
    const em = fork(),
        [body, session] = await Promise.all([
            readValidatedBody(event, (b) => bodySchema.safeParse(b)),
            getServerSession(event)
        ]),
        sessionUser = (await em.findOne(AppUser, { id: session!.id }))!

    if (!body.success)
        throw createError({
            statusCode: 400,
            statusMessage: 'Bad Request: Invalid body parameters',
            message: JSON.stringify(body.error.errors)
        })

    const sessionUserOrgRoles = await em.findAll(AppUserOrganizationRole, { where: { appUser: sessionUser } })

    // Only system admins and organization admins can create new appusers
    if (sessionUser.isSystemAdmin || sessionUserOrgRoles.some(r => { return r.role.name === 'Organization Admin' })) {
        const newAppUser = new AppUser({
            id: body.data.id,
            name: '{Anonymous}',
            creationDate: new Date(),
            // Only system admins can create other system admins
            isSystemAdmin: sessionUser.isSystemAdmin ? body.data.isSystemAdmin : false
        })

        await em.persistAndFlush(newAppUser)

        return newAppUser.id
    } else {
        throw createError({
            statusCode: 403,
            statusMessage: 'Forbidden: You must be a system admin or organization admin to create a user.'
        })
    }
})