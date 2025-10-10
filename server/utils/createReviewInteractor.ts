import { PermissionInteractor, ReviewInteractor } from '../application/index.js'
import { RequirementRepository, EndorsementRepository } from '../data/repositories/index.js'
import { createEntraService } from './createEntraService.js'
import { createOrganizationInteractor } from './createOrganizationInteractor.js'
import type { H3Event } from 'h3'
import type { UserSession } from '#auth-utils'

export interface CreateReviewInteractorParams {
    event: H3Event
    session: UserSession
    organizationId?: string
    organizationSlug?: string
    solutionSlug: string
}

/**
 * Creates a new ReviewInteractor instance.
 * @param options - The parameters for creating the interactor.
 * @returns the new ReviewInteractor instance.
 */
export const createReviewInteractor = async ({ event, session, organizationId, organizationSlug, solutionSlug }: CreateReviewInteractorParams) => {
    const entraService = createEntraService(),
        permissionInteractor = new PermissionInteractor({ event, session, entraService }),
        requirementRepository = new RequirementRepository({ em: event.context.em }),
        organizationInteractor = createOrganizationInteractor({ event, session, organizationId, organizationSlug }),
        org = await organizationInteractor.getOrganization(),
        solution = await organizationInteractor.getSolutionBySlug(solutionSlug)

    return new ReviewInteractor({
        permissionInteractor,
        endorsementRepository: new EndorsementRepository({ em: event.context.em }),
        requirementRepository,
        organizationId: org.id,
        solutionId: solution.id
    })
}
