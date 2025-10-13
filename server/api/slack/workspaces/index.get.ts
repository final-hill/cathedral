import { z } from 'zod'
import { PermissionInteractor, SlackWorkspaceInteractor } from '~~/server/application'
import { SlackWorkspaceRepository } from '~~/server/data/repositories'

const querySchema = z.object({
    organizationSlug: z.string().min(1, 'Organization slug is required')
})

/**
 * Get Slack workspace integrations for an organization
 */
export default defineEventHandler(async (event) => {
    const { organizationSlug } = await validateEventQuery({ event, schema: querySchema }),
        session = await requireUserSession(event),
        em = event.context.em,
        entraService = createEntraService(),
        permissionInteractor = new PermissionInteractor({ event, session, entraService }),
        organizationInteractor = createOrganizationInteractor({ event, session, organizationSlug }),
        organization = await organizationInteractor.getOrganization(),
        slackWorkspaceInteractor = new SlackWorkspaceInteractor({
            repository: new SlackWorkspaceRepository({ em }),
            permissionInteractor
        })

    return await slackWorkspaceInteractor.getOrganizationWorkspaces({ organizationId: organization.id, organizationName: organization.name })
        .catch(handleDomainException)
})
