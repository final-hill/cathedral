import { AppUserInteractor, OrganizationInteractor, PermissionInteractor, RequirementInteractor } from '../application/index.js'
import { OrganizationRepository, RequirementRepository } from '../data/repositories/index.js'
import { createEntraService } from './createEntraService.js'
import type { H3Event } from 'h3'
import type { UserSession } from '#auth-utils'

export interface CreateRequirementInteractorParams {
    event: H3Event
    session: UserSession
    organizationId?: string
    organizationSlug?: string
    solutionSlug: string
}

/**
 * Creates a new RequirementInteractor instance.
 * @param options - The parameters for creating the interactor.
 * @returns the new RequirementInteractor instance.
 */
export const createRequirementInteractor = async ({ event, session, organizationId, organizationSlug, solutionSlug }: CreateRequirementInteractorParams) => {
    const entraService = createEntraService(),
        permissionInteractor = new PermissionInteractor({ event, session, entraService }),
        appUserInteractor = new AppUserInteractor({ permissionInteractor, entraService }),
        organizationInteractor = new OrganizationInteractor({
            repository: new OrganizationRepository({ em: event.context.em, organizationId, organizationSlug }),
            permissionInteractor,
            appUserInteractor
        }),
        org = await organizationInteractor.getOrganization(),
        solution = await organizationInteractor.getSolutionBySlug(solutionSlug)

    return new RequirementInteractor({
        repository: new RequirementRepository({ em: event.context.em }),
        permissionInteractor,
        appUserInteractor,
        organizationId: org.id,
        solutionId: solution.id
    })
}
