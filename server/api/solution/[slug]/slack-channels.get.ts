import { z } from 'zod'
import { SlackChannelInteractor, PermissionInteractor } from '~~/server/application'
import { SlackRepository } from '~~/server/data/repositories'
import { SlackService } from '~~/server/data/services'
import { Organization, Solution } from '#shared/domain'

const paramSchema = Solution.pick({ slug: true }),
    { id: organizationId, slug: organizationSlug } = Organization.pick({ id: true, slug: true }).partial().shape,
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
    const { slug } = await validateEventParams({ event, schema: paramSchema }),
        { organizationId, organizationSlug } = await validateEventQuery({ event, schema: querySchema }),
        session = await requireUserSession(event),
        config = useRuntimeConfig(),
        em = event.context.em,
        entraService = createEntraService(),
        permissionInteractor = new PermissionInteractor({ event, session, entraService }),
        organizationInteractor = createOrganizationInteractor({ event, session, organizationId, organizationSlug }),
        organization = await organizationInteractor.getOrganization(),
        solution = await organizationInteractor.getSolutionBySlug(slug),
        slackChannelInteractor = new SlackChannelInteractor({
            repository: new SlackRepository({ em }),
            permissionInteractor,
            slackService: new SlackService({ token: config.slackBotToken, slackSigningSecret: config.slackSigningSecret })
        })

    return await slackChannelInteractor.getChannelsForSolution({ organizationId: organization.id, solutionId: solution.id })
        .catch(handleDomainException)
})
