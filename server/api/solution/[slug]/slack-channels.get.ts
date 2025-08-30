import { z } from 'zod'
import { SlackChannelInteractor, PermissionInteractor, OrganizationInteractor } from '~~/server/application'
import { SlackRepository, OrganizationRepository } from '~~/server/data/repositories'
import { SlackService } from '~~/server/data/services'
import { Organization, Solution } from '#shared/domain'

const paramSchema = Solution.innerType().pick({ slug: true }),
    { id: organizationId, slug: organizationSlug } = Organization.innerType().pick({ id: true, slug: true }).partial().shape,
    querySchema = z.object({
        organizationId,
        organizationSlug
    }).refine((value) => {
        return value.organizationId !== undefined || value.organizationSlug !== undefined
    }, 'At least one of organizationId or organizationSlug should be provided')

/**
 * Get Slack channel links for a solution
 */
export default defineEventHandler(async (event) => {
    const { slug } = await validateEventParams(event, paramSchema),
        { organizationId, organizationSlug } = await validateEventQuery(event, querySchema),
        session = await requireUserSession(event),
        config = useRuntimeConfig(),
        em = event.context.em,
        entraService = createEntraService(),
        permissionInteractor = new PermissionInteractor({ event, session, entraService }),
        organizationInteractor = new OrganizationInteractor({
            repository: new OrganizationRepository({ em, organizationId, organizationSlug }),
            permissionInteractor,
            appUserInteractor: null as never // Not needed for this operation
        }),
        organization = await organizationInteractor.getOrganization(),
        solution = await organizationInteractor.getSolutionBySlug(slug),
        slackChannelInteractor = new SlackChannelInteractor({
            repository: new SlackRepository({ em }),
            permissionInteractor,
            slackService: new SlackService(config.slackBotToken, config.slackSigningSecret)
        })

    return await slackChannelInteractor.getChannelsForSolution(organization.id, solution.id)
        .catch(handleDomainException)
})
