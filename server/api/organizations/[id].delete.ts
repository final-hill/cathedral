import { fork } from "~/server/data/orm"
import Organization from "~/server/domain/application/Organization"
import AppUserOrganizationRole from "~/server/domain/application/AppUserOrganizationRole"
import { getServerSession } from '#auth'

/**
 * Delete an organization by id.
 */
export default defineEventHandler(async (event) => {
    const id = event.context.params?.id;

    if (!id)
        throw createError({
            statusCode: 400,
            statusMessage: "Bad Request: id is required."
        })

    const em = fork(),
        session = (await getServerSession(event))!,
        organization = em.getReference(Organization, id),
        sessionUserOrgRoles = await em.find(AppUserOrganizationRole, {
            appUserId: session.user.id,
            organization
        })

    // An organization can only be deleted by a system admin
    // or the associated organization admin
    if (session.user.isSystemAdmin || sessionUserOrgRoles.some(r => r.role.name === 'Organization Admin')) {
        em.remove(organization)
        await em.flush()
    } else {
        throw createError({
            statusCode: 403,
            statusMessage: "Forbidden: You must be a system admin or an organization admin to delete an organization."
        })
    }
})
