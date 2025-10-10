import { z } from 'zod'
import { createSlackWorkspaceInteractor } from '~~/server/application/slack/factory'

const paramsSchema = z.object({
        teamId: z.string().min(1, 'Team ID is required')
    }),
    bodySchema = z.object({
        organizationSlug: z.string().min(1, 'Organization slug is required')
    })

/**
 * Disconnect/deactivate a Slack workspace integration
 */
export default defineEventHandler(async (event) => {
    const { teamId } = await validateEventParams(event, paramsSchema),
        { organizationSlug } = await validateEventBody(event, bodySchema),
        session = await requireUserSession(event),
        em = event.context.em,
        organizationInteractor = createOrganizationInteractor({ event, session, organizationSlug }),
        organization = await organizationInteractor.getOrganization(),
        workspaceInteractor = createSlackWorkspaceInteractor({ em, session })

    await workspaceInteractor.removeWorkspaceFromOrganization(
        organization.id,
        teamId
    ).catch(handleDomainException)

    return { success: true, message: 'Slack workspace disconnected successfully' }
})
