import { z } from "zod"
import { Slack, PermissionInteractor, OrganizationInteractor } from "~/application"
import { SlackRepository, PermissionRepository, OrganizationRepository } from '~/server/data/repositories'
import { SlackService } from '~/server/data/services'
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
        session = await requireUserSession(event),
        config = useRuntimeConfig(),
        em = event.context.em

    const permissionInteractor = new PermissionInteractor({
        userId: session.user.id,
        repository: new PermissionRepository({ em })
    });

    // Get organization and solution for context
    const organizationInteractor = new OrganizationInteractor({
        repository: new OrganizationRepository({ em, organizationId, organizationSlug }),
        permissionInteractor,
        appUserInteractor: null as any // Not needed for this operation
    });
    const organization = await organizationInteractor.getOrganization();
    const solution = await organizationInteractor.getSolutionBySlug(slug);
    const slackChannelInteractor = new Slack.SlackChannelInteractor({
        repository: new SlackRepository({ em }),
        permissionInteractor,
        slackService: new SlackService(config.slackBotToken, config.slackSigningSecret)
    });

    return await slackChannelInteractor.getChannelsForSolution(organization.id, solution.id)
        .catch(handleDomainException);
});
