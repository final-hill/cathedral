import { z } from "zod"
import { fork } from "~/server/data/orm"
import { getServerSession } from "#auth"
import AppUserOrganizationRole from "~/server/domain/application/AppUserOrganizationRole"
import AppRole from "~/server/domain/application/AppRole"
import AppUser from "~/server/domain/application/AppUser"

const bodySchema = z.object({
    email: z.string(),
    organizationId: z.string().uuid(),
    role: z.nativeEnum(AppRole)
})

/**
 * Invite an appuser to an organization with a role
 */
export default defineEventHandler(async (event) => {
    const body = await readValidatedBody(event, (b) => bodySchema.safeParse(b))

    if (!body.success)
        throw createError({
            statusCode: 400,
            statusMessage: 'Bad Request: Invalid body parameters',
            message: JSON.stringify(body.error.errors)
        })

    const em = fork(),
        session = (await getServerSession(event))!,
        [sessionUserRole, appUser] = await Promise.all([
            em.findOne(AppUserOrganizationRole, {
                appUser: session.id,
                organization: body.data.organizationId
            }, { populate: ['appUser'] }),
            em.findOne(AppUser, {
                email: body.data.email
            })
        ]),
        existingOrgAppUserRole = await em.findOne(AppUserOrganizationRole, {
            appUser: appUser,
            organization: body.data.organizationId
        })

    if (!appUser)
        throw createError({
            statusCode: 404,
            statusMessage: "Not Found",
            message: "The appuser with the given email does not exist."
        })
    if (!sessionUserRole && !session.isSystemAdmin)
        throw createError({
            statusCode: 403,
            statusMessage: "Forbidden",
            message: "You are not associated with the organization."
        })
    if (!session.isSystemAdmin && sessionUserRole && sessionUserRole.role !== AppRole.ORGANIZATION_ADMIN)
        throw createError({
            statusCode: 403,
            statusMessage: "Forbidden",
            message: "You must be an organization admin or a system admin to invite an appuser."
        })
    if (existingOrgAppUserRole)
        throw createError({
            statusCode: 409,
            statusMessage: "Conflict",
            message: "The appuser is already associated with the organization."
        })

    em.create(AppUserOrganizationRole, {
        appUser: appUser,
        organization: body.data.organizationId,
        role: body.data.role
    })

    await em.flush()
})