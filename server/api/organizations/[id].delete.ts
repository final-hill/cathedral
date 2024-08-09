import { fork } from "~/server/data/orm"
import Organization from "~/server/domain/application/Organization"
import AppUserOrganizationRole from "~/server/domain/application/AppUserOrganizationRole"
import { getServerSession } from '#auth'
import AppRole from "~/server/domain/application/AppRole"

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
        sessionUserOrgRole = await em.findOne(AppUserOrganizationRole, {
            appUser: session.id,
            organization
        })

    // An organization can only be deleted by a system admin
    // or the associated organization admin
    if (session.isSystemAdmin || sessionUserOrgRole?.role === AppRole.ORGANIZATION_ADMIN) {
        em.remove(organization)
        await em.flush()
    } else {
        throw createError({
            statusCode: 403,
            statusMessage: "Forbidden: You must be a system admin or an organization admin to delete an organization."
        })
    }
})
