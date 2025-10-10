import { AppUserInteractor, PermissionInteractor, RequirementInteractor, ReviewInteractor } from '../application/index.js'
import { RequirementRepository, EndorsementRepository } from '../data/repositories/index.js'
import { createEntraService } from './createEntraService.js'
import { createOrganizationInteractor } from './createOrganizationInteractor.js'
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
        requirementRepository = new RequirementRepository({ em: event.context.em }),
        endorsementRepository = new EndorsementRepository({ em: event.context.em }),
        organizationInteractor = createOrganizationInteractor({ event, session, organizationId, organizationSlug }),
        org = await organizationInteractor.getOrganization(),
        solution = await organizationInteractor.getSolutionBySlug(solutionSlug),
        reviewInteractor = new ReviewInteractor({
            permissionInteractor,
            endorsementRepository,
            requirementRepository,
            organizationId: org.id,
            solutionId: solution.id
        })

    return new RequirementInteractor({
        repository: requirementRepository,
        permissionInteractor,
        appUserInteractor,
        reviewInteractor,
        organizationId: org.id,
        solutionId: solution.id
    })
}
