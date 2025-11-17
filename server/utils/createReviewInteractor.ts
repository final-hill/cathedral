import { PermissionInteractor, ReviewInteractor, ReadabilityCheckInteractor } from '../application/index.js'
import { RequirementRepository, EndorsementRepository } from '../data/repositories/index.js'
import { LanguageToolService, ReadabilityAnalysisService, RequirementTypeCorrespondenceService, GlossaryTermIdentificationService } from '../data/services/index.js'
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
        endorsementRepository = new EndorsementRepository({ em: event.context.em }),
        organizationInteractor = createOrganizationInteractor({ event, session, organizationId, organizationSlug }),
        org = await organizationInteractor.getOrganization(),
        solution = await organizationInteractor.getSolutionBySlug(solutionSlug),
        config = useRuntimeConfig(event),
        languageToolService = new LanguageToolService({
            baseUrl: config.languagetoolBaseUrl
        }),
        readabilityAnalysisService = new ReadabilityAnalysisService(),
        typeCorrespondenceService = new RequirementTypeCorrespondenceService({
            apiKey: config.azureOpenaiApiKey,
            apiVersion: config.azureOpenaiApiVersion,
            endpoint: config.azureOpenaiEndpoint,
            deployment: config.azureOpenaiDeploymentId
        }),
        glossaryTermService = new GlossaryTermIdentificationService({
            apiKey: config.azureOpenaiApiKey,
            apiVersion: config.azureOpenaiApiVersion,
            endpoint: config.azureOpenaiEndpoint,
            deployment: config.azureOpenaiDeploymentId
        }),
        readabilityCheckInteractor = new ReadabilityCheckInteractor({
            languageToolService,
            readabilityService: readabilityAnalysisService,
            typeCorrespondenceService,
            glossaryTermService,
            endorsementRepository,
            requirementRepository
        })

    return new ReviewInteractor({
        permissionInteractor,
        endorsementRepository,
        requirementRepository,
        readabilityCheckInteractor,
        organizationId: org.id,
        solutionId: solution.id,
        organizationSlug: org.slug
    })
}
