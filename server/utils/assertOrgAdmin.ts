import type { H3Event, EventHandlerRequest } from 'h3'
import { getServerSession } from '#auth'
import { AppRole, AppUser, AppUserOrganizationRole } from "~/domain/application/index.js"
import { Organization } from "~/domain/requirements/index.js"
import { fork } from "~/server/data/orm.js"

/**
 * Asserts that the user is an admin of the organization that owns the solution or is a system admin
 * @param event
 * @param organizationId
 */
export default async function assertOrgAdmin(event: H3Event<EventHandlerRequest>, organizationId: string): Promise<{ organization: Organization, sessionUser: AppUser }> {
    const session = (await getServerSession(event))!,
        em = fork(),
        organization = await em.findOne(Organization, { id: organizationId })

    if (!organization)
        throw createError({
            statusCode: 400,
            statusMessage: `Bad Request: No organization found with id: ${organizationId}`
        })

    const sessionUserOrgRole = await em.findOne(AppUserOrganizationRole, {
        appUser: session.id,
        organization
    }),
        isOrgAdmin = sessionUserOrgRole?.role && [AppRole.ORGANIZATION_ADMIN].includes(sessionUserOrgRole?.role)

    if (!session.isSystemAdmin && !isOrgAdmin)
        throw createError({
            statusCode: 403,
            statusMessage: 'Forbidden: You do not have permission to access these items'
        })

    return {
        organization,
        sessionUser: sessionUserOrgRole?.appUser ?? (await em.findOne(AppUser, session.id))!
    }
}