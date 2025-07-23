import { z } from 'zod'
import { Slack, PermissionInteractor, OrganizationInteractor } from '~/application'
import { SlackRepository, OrganizationRepository } from '~/server/data/repositories'
import { SlackService } from '~/server/data/services'
import { createEntraGroupService } from '~/server/utils/createEntraGroupService'
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
    return value.organizationId !== undefined || value.organizationSlug !== undefined
}, 'At least one of organizationId or organizationSlug should be provided')

/**
 * Unlink a Slack channel from a solution
 */
export default defineEventHandler(async (event) => {
    // Note: slug parameter is extracted but not used - organization context comes from request body
    const { slug: _solutionSlug } = await validateEventParams(event, paramSchema),
        { organizationId, organizationSlug, channelId, teamId } = await validateEventBody(event, bodySchema),
        session = await requireUserSession(event),
        config = useRuntimeConfig(),
        em = event.context.em

    const permissionInteractor = new PermissionInteractor({
        session,
        groupService: createEntraGroupService()
    })

    // Get organization and solution for context
    const organizationInteractor = new OrganizationInteractor({
        repository: new OrganizationRepository({ em, organizationId, organizationSlug }),
        permissionInteractor,
        appUserInteractor: null as never // Not needed for this operation
    })
    const organization = await organizationInteractor.getOrganization()

    const slackChannelInteractor = new Slack.SlackChannelInteractor({
        repository: new SlackRepository({ em }),
        permissionInteractor,
        slackService: new SlackService(config.slackBotToken, config.slackSigningSecret)
    })

    return slackChannelInteractor.unlinkChannelFromSolution(organization.id, channelId, teamId)
        .catch(handleDomainException)
})
