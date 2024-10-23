import { z } from "zod"
import { fork } from "~/server/data/orm.js"
import { AppUser, AppUserOrganizationRole } from "~/domain/application/index.js"

const paramSchema = z.object({
    id: z.string().uuid()
})

const querySchema = z.object({
    organizationId: z.string().uuid(),
})

/**
 * Returns an appuser by id in a given organization
 */
export default defineEventHandler(async (event) => {
    const { id } = await validateEventParams(event, paramSchema),
        { organizationId } = await validateEventQuery(event, querySchema),
        { } = await assertOrgReader(event, organizationId),
        em = fork(),
        appUserRole = await em.findOne(AppUserOrganizationRole, {
            appUser: id,
            organization: organizationId
        }, { populate: ['appUser'] })

    if (!appUserRole)
        throw createError({
            statusCode: 404,
            statusMessage: "Not Found",
            message: "AppUser not found for the given ID and organization."
        })

    return {
        ...appUserRole.appUser,
        role: appUserRole.role
    } as AppUser
})