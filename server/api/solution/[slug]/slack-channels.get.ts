import { z } from "zod"
import { SlackInteractor, PermissionInteractor } from "~/application"
import { SlackRepository, PermissionRepository } from '~/server/data/repositories'
import { SlackService, NaturalLanguageToRequirementService } from '~/server/data/services'
import handleDomainException from '~/server/utils/handleDomainException'
import { Organization, Solution } from '#shared/domain'

const paramSchema = Solution.innerType().pick({ slug: true })

const { id: organizationId, slug: organizationSlug } = Organization.innerType().pick({ id: true, slug: true }).partial().shape

const querySchema = z.object({
    organizationId,
    organizationSlug
}).refine((value) => {
    return value.organizationId !== undefined || value.organizationSlug !== undefined;
}, "At least one of organizationId or organizationSlug should be provided");

/**
 * Get Slack channel links for a solution
 */
export default defineEventHandler(async (event) => {
    const { slug } = await validateEventParams(event, paramSchema),
        { organizationId, organizationSlug } = await validateEventQuery(event, querySchema),
        session = (await requireUserSession(event))!,
        config = useRuntimeConfig()

    const slackInteractor = new SlackInteractor({
        repository: new SlackRepository({ em: event.context.em }),
        nlrService: new NaturalLanguageToRequirementService({
            apiKey: config.azureOpenaiApiKey,
            apiVersion: config.azureOpenaiApiVersion,
            endpoint: config.azureOpenaiEndpoint,
            deployment: config.azureOpenaiDeploymentId
        }),
        permissionInteractor: new PermissionInteractor({
            userId: session.user.id,
            repository: new PermissionRepository({ em: event.context.em })
        }),
        slackService: new SlackService(config.slackBotToken, config.slackSigningSecret)
    })

    return await slackInteractor.getChannelsForSolutionWithOrgValidation({
        organizationId,
        organizationSlug,
        solutionSlug: slug,
        userId: session.user.id
    }).catch(handleDomainException);
})
