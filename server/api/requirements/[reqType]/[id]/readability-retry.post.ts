import { z } from 'zod'
import { ReqType } from '#shared/domain'
import { ReadabilityCheckInteractor } from '../../../../application/automated-checks/ReadabilityCheckInteractor.js'
import { LanguageToolService, ReadabilityAnalysisService, RequirementTypeCorrespondenceService, GlossaryTermIdentificationService } from '../../../../data/services/index.js'
import { EndorsementRepository, RequirementRepository } from '../../../../data/repositories/index.js'

const paramSchema = z.object({
    id: z.string().uuid(),
    reqType: z.nativeEnum(ReqType)
})

/**
 * Manual retry endpoint for failed readability checks
 * Re-runs failed readability checks and updates endorsements
 */
export default defineEventHandler(async (event) => {
    await requireUserSession(event)

    const { id, reqType } = await validateEventParams({ event, schema: paramSchema }),
        bodySchema = z.object({
            organizationSlug: z.string(),
            solutionSlug: z.string()
        }),
        { organizationSlug } = await validateEventBody({ event, schema: bodySchema }),
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
        endorsementRepository = new EndorsementRepository({ em: event.context.em }),
        requirementRepository = new RequirementRepository({ em: event.context.em }),
        readabilityCheckInteractor = new ReadabilityCheckInteractor({
            languageToolService,
            readabilityService: readabilityAnalysisService,
            typeCorrespondenceService,
            glossaryTermService,
            endorsementRepository,
            requirementRepository
        }),
        results = await readabilityCheckInteractor.retryFailedChecks({
            requirementId: id,
            reqType,
            organizationSlug,
            systemActorId: null // Automated checks have no actor
        })

    return results
})
