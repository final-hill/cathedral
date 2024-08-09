import { z } from "zod"
import { fork } from "~/server/data/orm"
import { getServerSession } from "#auth"
import AppUserOrganizationRole from "~/server/domain/application/AppUserOrganizationRole"
import AppRole from "~/server/domain/application/AppRole"

const bodySchema = z.object({
    organizationId: z.string().uuid(),
})

/**
 * Delete an appuser by id in a given organization
 */
export default defineEventHandler(async (event) => {
    const id = event.context.params?.id,
        body = await readValidatedBody(event, (b) => bodySchema.safeParse(b))

    if (!body.success)
        throw createError({
            statusCode: 400,
            statusMessage: 'Bad Request: Invalid body parameters',
            message: JSON.stringify(body.error.errors)
        })
    if (!id)
        throw createError({
            statusCode: 400,
            statusMessage: "Bad Request: id is required."
        })

    const em = fork(),
        session = (await getServerSession(event))!,
        [sessionUserRole, appUserRole, orgAdminCount] = await Promise.all([
            em.findOne(AppUserOrganizationRole, {
                appUser: session.id,
                organization: body.data.organizationId
            }, { populate: ['appUser'] }),
            em.findOne(AppUserOrganizationRole, {
                appUser: id,
                organization: body.data.organizationId
            }, { populate: ['appUser'] }),
            em.count(AppUserOrganizationRole, {
                organization: body.data.organizationId,
                role: AppRole.ORGANIZATION_ADMIN
            })
        ])

    if (!appUserRole)
        throw createError({
            statusCode: 404,
            statusMessage: "Not Found",
            message: "AppUser not found for the given ID and organization."
        })
    if (!sessionUserRole && !session.isSystemAdmin)
        throw createError({
            statusCode: 403,
            statusMessage: "Forbidden",
            message: "You are not associated with the organization."
        })
    if (appUserRole.role === AppRole.ORGANIZATION_ADMIN && orgAdminCount === 1)
        throw createError({
            statusCode: 403,
            statusMessage: "Forbidden",
            message: "You cannot delete the last organization admin."
        })
    if (!session.isSystemAdmin && sessionUserRole && sessionUserRole.role !== AppRole.ORGANIZATION_ADMIN)
        throw createError({
            statusCode: 403,
            statusMessage: "Forbidden",
            message: "You must be an organization admin or a system admin to delete an appuser."
        })

    // Removing the relationship to the organization and NOT the appuser itself
    em.remove(appUserRole)
    await em.flush()
})