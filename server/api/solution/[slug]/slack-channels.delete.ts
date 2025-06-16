import { z } from "zod"
import { SlackInteractor, PermissionInteractor } from "~/application"
import { SlackRepository, PermissionRepository, OrganizationRepository } from '~/server/data/repositories'
import { SlackService, NaturalLanguageToRequirementService } from '~/server/data/services'
import handleDomainException from '~/server/utils/handleDomainException'
import { Organization, Solution } from '#shared/domain'

const paramSchema = Solution.innerType().pick({ slug: true })

const { id: organizationId, slug: organizationSlug } = Organization.innerType().pick({ id: true, slug: true }).partial().shape

const bodySchema = z.object({
    organizationId,
    organizationSlug,
    channelId: z.string().describe('The Slack channel ID to unlink'),
    teamId: z.string().describe('The Slack team ID')
}).refine((value) => {
    return value.organizationId !== undefined || value.organizationSlug !== undefined;
}, "At least one of organizationId or organizationSlug should be provided");

/**
 * Unlink a Slack channel from a solution
 */
export default defineEventHandler(async (event) => {
    const { slug } = await validateEventParams(event, paramSchema),
        { organizationId, organizationSlug, channelId, teamId } = await validateEventBody(event, bodySchema),
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

    const orgRepository = new OrganizationRepository({ em: event.context.em, organizationId, organizationSlug })

    return slackInteractor.unlinkSlackChannelFromSolution({ 
        solutionSlug: slug, 
        channelId, 
        teamId, 
        orgRepository 
    }).catch(handleDomainException);
})
