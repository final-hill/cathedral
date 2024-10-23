import { z } from "zod"
import { fork } from "~/server/data/orm.js"
import { AppRole, AppUser, AppUserOrganizationRole } from "~/domain/application/index.js"

const bodySchema = z.object({
    email: z.string(),
    organizationId: z.string().uuid(),
    role: z.nativeEnum(AppRole)
})

/**
 * Invite an appuser to an organization with a role
 */
export default defineEventHandler(async (event) => {
    const { email, organizationId, role } = await validateEventBody(event, bodySchema),
        { organization } = await assertOrgAdmin(event, organizationId),
        em = fork(),
        appUser = await em.findOne(AppUser, { email: email }),
        existingOrgAppUserRole = await em.findOne(AppUserOrganizationRole, {
            appUser: appUser,
            organization: organizationId
        })

    if (!appUser)
        throw createError({
            statusCode: 404,
            statusMessage: "Not Found",
            message: "The appuser with the given email does not exist."
        })
    if (existingOrgAppUserRole)
        throw createError({
            statusCode: 409,
            statusMessage: "Conflict",
            message: "The appuser is already associated with the organization."
        })

    em.create(AppUserOrganizationRole, { appUser, organization, role })

    await em.flush()
})