import { z } from 'zod'
import { PermissionInteractor, OrganizationInteractor } from '~/application'
import { OrganizationRepository } from '~/server/data/repositories'
import { createEntraGroupService } from '~/server/utils/createEntraGroupService'
import { createSlackWorkspaceInteractor } from '~/application/slack/factory'
import handleDomainException from '~/server/utils/handleDomainException'

const paramsSchema = z.object({
    teamId: z.string().min(1, 'Team ID is required')
})

const bodySchema = z.object({
    organizationSlug: z.string().min(1, 'Organization slug is required')
})

/**
 * Disconnect/deactivate a Slack workspace integration
 */
export default defineEventHandler(async (event) => {
    const { teamId } = await validateEventParams(event, paramsSchema),
        { organizationSlug } = await validateEventBody(event, bodySchema),
        session = await requireUserSession(event),
        em = event.context.em

    const permissionInteractor = new PermissionInteractor({
        session,
        groupService: createEntraGroupService()
    })

    const organizationInteractor = new OrganizationInteractor({
            repository: new OrganizationRepository({ em, organizationSlug }),
            permissionInteractor,
            appUserInteractor: null as never // We don't need this for this operation
        }),
        organization = await organizationInteractor.getOrganization()

    const workspaceInteractor = createSlackWorkspaceInteractor({
        em,
        session
    })

    await workspaceInteractor.removeWorkspaceFromOrganization(
        organization.id,
        teamId
    ).catch(handleDomainException)

    return { success: true, message: 'Slack workspace disconnected successfully' }
})
