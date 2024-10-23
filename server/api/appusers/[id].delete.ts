import { z } from "zod"
import { fork } from "~/server/data/orm.js"
import { AppRole, AppUserOrganizationRole } from "~/server/domain/application/index.js"

const paramSchema = z.object({
    id: z.string().uuid()
})

const bodySchema = z.object({
    organizationId: z.string().uuid(),
})

/**
 * Delete an appuser by id in a given organization
 */
export default defineEventHandler(async (event) => {
    const { id } = await validateEventParams(event, paramSchema),
        { organizationId } = await validateEventBody(event, bodySchema),
        em = fork(),
        { organization } = await assertOrgAdmin(event, organizationId),
        [appUserRole, orgAdminCount] = await Promise.all([
            em.findOne(AppUserOrganizationRole, {
                appUser: id,
                organization
            }, { populate: ['appUser'] }),
            em.count(AppUserOrganizationRole, {
                organization,
                role: AppRole.ORGANIZATION_ADMIN
            })
        ])

    if (!appUserRole)
        throw createError({
            statusCode: 404,
            statusMessage: "Not Found",
            message: "AppUser not found for the given ID and organization."
        })
    if (appUserRole.role === AppRole.ORGANIZATION_ADMIN && orgAdminCount === 1)
        throw createError({
            statusCode: 403,
            statusMessage: "Forbidden",
            message: "You cannot delete the last organization admin."
        })

    // Removing the relationship to the organization and NOT the appuser itself
    await em.remove(appUserRole).flush()
})