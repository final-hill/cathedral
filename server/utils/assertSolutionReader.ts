import type { H3Event, EventHandlerRequest } from 'h3'
import { getServerSession } from '#auth'
import AppUserOrganizationRole from "~/server/domain/application/AppUserOrganizationRole"
import { fork } from "~/server/data/orm"
import AppUser from '../domain/application/AppUser';
import Solution from '../domain/application/Solution';
import AppRole from '../domain/application/AppRole';

/**
 * Asserts that the user is a member of the organization that owns the solution or is a system admin
 * @param event
 * @param solutionId
 */
// Currently, this is no different from assertOrgReader, but it's a good idea to keep them separate in case they diverge in the future
export default async function assertSolutionReader(event: H3Event<EventHandlerRequest>, solutionId: string): Promise<{ solution: Solution, sessionUser: AppUser }> {
    const session = (await getServerSession(event))!,
        em = fork(),
        solution = await em.findOne(Solution, { id: solutionId })

    if (!solution)
        throw createError({
            statusCode: 400,
            statusMessage: `Bad Request: No solution found with id: ${solutionId}`
        })

    const sessionUserOrgRole = await em.findOne(AppUserOrganizationRole, {
        appUser: session.id,
        organization: solution.organization.id
    }),
        isOrgReader = sessionUserOrgRole?.role && [AppRole.ORGANIZATION_ADMIN, AppRole.ORGANIZATION_CONTRIBUTOR, AppRole.ORGANIZATION_READER].includes(sessionUserOrgRole?.role)

    if (!session.isSystemAdmin && !isOrgReader)
        throw createError({
            statusCode: 403,
            statusMessage: 'Forbidden: You do not have permission to access these items'
        })

    return {
        solution,
        sessionUser: sessionUserOrgRole?.appUser ?? (await em.findOne(AppUser, session.id))!
    }
}