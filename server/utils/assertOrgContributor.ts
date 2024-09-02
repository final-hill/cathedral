import type { H3Event, EventHandlerRequest } from 'h3'
import { getServerSession } from '#auth'
import AppUserOrganizationRole from "~/server/domain/application/AppUserOrganizationRole"
import { fork } from "~/server/data/orm"
import AppRole from '../domain/application/AppRole'
import AppUser from '../domain/application/AppUser';
import Organization from '../domain/application/Organization'

/**
 * Asserts that the user is a contributor of the organization that owns the solution or is a system admin
 * @param event
 * @param organizationId
 */
export default async function assertOrgContributor(event: H3Event<EventHandlerRequest>, organizationId: string): Promise<{ organization: Organization, sessionUser: AppUser }> {
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
    });

    if (!session.isSystemAdmin && sessionUserOrgRole?.role !== AppRole.ORGANIZATION_CONTRIBUTOR)
        throw createError({
            statusCode: 403,
            statusMessage: 'Forbidden: You do not have permission to view these items'
        })

    return {
        organization,
        sessionUser: sessionUserOrgRole?.appUser ?? (await em.findOne(AppUser, session.id))!
    }
}