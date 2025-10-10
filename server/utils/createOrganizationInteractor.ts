import { AppUserInteractor, OrganizationInteractor, PermissionInteractor } from '../application/index.js'
import { OrganizationRepository, RequirementRepository } from '../data/repositories/index.js'
import { createEntraService } from './createEntraService.js'
import type { H3Event } from 'h3'
import type { UserSession } from '#auth-utils'

export interface CreateOrganizationInteractorParams {
    event: H3Event
    session: UserSession
    organizationId?: string
    organizationSlug?: string
}

/**
 * Creates a new OrganizationInteractor instance with all required dependencies.
 * @param options - The parameters for creating the interactor.
 * @returns the new OrganizationInteractor instance.
 */
export const createOrganizationInteractor = ({ event, session, organizationId, organizationSlug }: CreateOrganizationInteractorParams) => {
    const entraService = createEntraService(),
        permissionInteractor = new PermissionInteractor({ event, session, entraService }),
        appUserInteractor = new AppUserInteractor({ permissionInteractor, entraService }),
        requirementRepository = new RequirementRepository({ em: event.context.em })

    return new OrganizationInteractor({
        repository: new OrganizationRepository({ em: event.context.em, organizationId, organizationSlug }),
        requirementRepository,
        permissionInteractor,
        appUserInteractor
    })
}
