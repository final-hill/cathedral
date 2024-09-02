import type { H3Event, EventHandlerRequest } from 'h3'
import { getServerSession } from '#auth'
import AppUserOrganizationRole from "~/server/domain/application/AppUserOrganizationRole"
import { fork } from "~/server/data/orm"
import AppRole from '../domain/application/AppRole'
import AppUser from '../domain/application/AppUser';
import Solution from '../domain/application/Solution'

/**
 * Asserts that the user is an admin of the organization that owns the solution or is a system admin
 * @param event
 * @param solutionId
 */
// Currently, this is no different from assertOrgAdmin, but it's a good idea to keep them separate in case they diverge in the future
export default async function assertSolutionAdmin(event: H3Event<EventHandlerRequest>, solutionId: string): Promise<{ solution: Solution, sessionUser: AppUser }> {
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
    });

    if (!session.isSystemAdmin && sessionUserOrgRole?.role !== AppRole.ORGANIZATION_ADMIN)
        throw createError({
            statusCode: 403,
            statusMessage: 'Forbidden: You do not have permission to view these items'
        })

    return {
        solution: solution,
        sessionUser: sessionUserOrgRole?.appUser ?? (await em.findOne(AppUser, session.id))!
    }
}