import { z } from 'zod'
import { PermissionInteractor, OrganizationInteractor, SlackWorkspaceInteractor } from '~/application'
import { OrganizationRepository, SlackWorkspaceRepository } from '~/server/data/repositories'
import { createEntraGroupService } from '~/server/utils/createEntraGroupService'
import handleDomainException from '~/server/utils/handleDomainException'

const querySchema = z.object({
    organizationSlug: z.string().min(1, 'Organization slug is required')
})

/**
 * Get Slack workspace integrations for an organization
 */
export default defineEventHandler(async (event) => {
    const { organizationSlug } = await validateEventQuery(event, querySchema),
        session = await requireUserSession(event),
        em = event.context.em,
        permissionInteractor = new PermissionInteractor({
            event,
            session,
            groupService: createEntraGroupService()
        }),
        organizationInteractor = new OrganizationInteractor({
            repository: new OrganizationRepository({ em, organizationSlug }),
            permissionInteractor,
            appUserInteractor: null as never // We don't need this for this operation
        }),
        organization = await organizationInteractor.getOrganization(),
        slackWorkspaceInteractor = new SlackWorkspaceInteractor({
            repository: new SlackWorkspaceRepository({ em }),
            permissionInteractor
        })

    return await slackWorkspaceInteractor.getOrganizationWorkspaces(organization.id, organization.name)
        .catch(handleDomainException)
})
