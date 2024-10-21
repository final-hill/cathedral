import type { H3Event, EventHandlerRequest } from 'h3'
import { getServerSession } from '#auth'
import { AppRole, AppUser, AppUserOrganizationRole } from "~/server/domain/application/index.js"
import { ReqType, Solution } from "~/server/domain/requirements/index.js"
import { fork } from "~/server/data/orm.js"
import { Belongs } from '../domain/relations'

/**
 * Asserts that the user is a contributor of the organization that owns the solution or is a system admin
 * @param event
 * @param solutionId
 */
// Currently, this is no different from assertOrgContributor, but it's a good idea to keep them separate in case they diverge in the future
export default async function assertSolutionContributor(event: H3Event<EventHandlerRequest>, solutionId: string): Promise<{ solution: Solution, sessionUser: AppUser }> {
    const session = (await getServerSession(event))!,
        em = fork(),
        solution = await em.findOne(Solution, { id: solutionId }),
        solBelongsOrg = await em.findOne(Belongs, { left: solution, right: { req_type: ReqType.ORGANIZATION } })

    if (!solution || !solBelongsOrg)
        throw createError({
            statusCode: 400,
            statusMessage: `Bad Request: No solution found with id: ${solutionId} in the organization`
        })

    const sessionUserOrgRole = await em.findOne(AppUserOrganizationRole, {
        appUser: session.id,
        organization: solBelongsOrg.right
    }),
        isOrgContributor = sessionUserOrgRole?.role && [AppRole.ORGANIZATION_ADMIN, AppRole.ORGANIZATION_CONTRIBUTOR].includes(sessionUserOrgRole?.role)

    if (!session.isSystemAdmin && !isOrgContributor)
        throw createError({
            statusCode: 403,
            statusMessage: 'Forbidden: You do not have permission to access these items'
        })

    return {
        solution,
        sessionUser: sessionUserOrgRole?.appUser ?? (await em.findOne(AppUser, session.id))!
    }
}