import { z } from "zod"
import { fork } from "~/server/data/orm.js"
import { AppRole, AppUserOrganizationRole } from "~/server/domain/index.js"

const paramSchema = z.object({
    id: z.string().uuid()
})

const bodySchema = z.object({
    organizationId: z.string().uuid(),
    role: z.nativeEnum(AppRole)
})

/**
 * Update an appuser by id in a given organization to have a new role
 */
export default defineEventHandler(async (event) => {
    const { id } = await validateEventParams(event, paramSchema),
        { organizationId, role } = await validateEventBody(event, bodySchema),
        em = fork(),
        { } = await assertOrgAdmin(event, organizationId),
        [appUserRole, orgAdminCount] = await Promise.all([
            em.findOne(AppUserOrganizationRole, {
                appUser: id,
                organization: organizationId
            }, { populate: ['appUser'] }),
            em.count(AppUserOrganizationRole, {
                organization: organizationId,
                role: AppRole.ORGANIZATION_ADMIN
            })
        ])

    if (!appUserRole)
        throw createError({
            statusCode: 404,
            statusMessage: "Not Found",
            message: "AppUser not found for the given ID and organization."
        })
    // you can't remove the last organization admin
    if (appUserRole.role === AppRole.ORGANIZATION_ADMIN && orgAdminCount === 1
        && role !== AppRole.ORGANIZATION_ADMIN
    )
        throw createError({
            statusCode: 403,
            statusMessage: "Forbidden",
            message: "You can't remove the last organization admin."
        })

    appUserRole.role = role
    await em.flush()
})