import { z } from 'zod'
import { createSlackWorkspaceInteractor } from '~~/server/application/slack/factory'

const paramsSchema = z.object({
    teamId: z.string().min(1, 'Team ID is required')
})

/**
 * Refresh Slack workspace information from Slack API
 */
export default defineEventHandler(async (event) => {
    const { teamId } = await validateEventParams(event, paramsSchema),
        session = await requireUserSession(event),
        em = event.context.em,
        workspaceInteractor = createSlackWorkspaceInteractor({
            em,
            session
        }),
        updatedWorkspace = await workspaceInteractor.refreshWorkspaceFromSlackAPI(teamId)
            .catch(handleDomainException)

    return {
        success: true,
        message: 'Workspace information refreshed successfully',
        teamName: updatedWorkspace.teamName
    }
})
