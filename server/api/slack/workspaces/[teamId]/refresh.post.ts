import { z } from 'zod';
import { createSlackWorkspaceInteractor } from '~/application/slack/factory';
import handleDomainException from '~/server/utils/handleDomainException';

const paramsSchema = z.object({
    teamId: z.string().min(1, 'Team ID is required')
});

/**
 * Refresh Slack workspace information from Slack API
 */
export default defineEventHandler(async (event) => {
    const { teamId } = await validateEventParams(event, paramsSchema),
        session = await requireUserSession(event),
        em = event.context.em;

    // Create workspace interactor using Clean Architecture factory
    const workspaceInteractor = createSlackWorkspaceInteractor({
        em,
        userId: session.user.id
    });

    // Use the workspace interactor to refresh metadata from Slack API
    // Note: Permission checking and workspace existence validation is handled internally by the interactor
    const updatedWorkspace = await workspaceInteractor.refreshWorkspaceFromSlackAPI(teamId)
        .catch(handleDomainException);

    return {
        success: true,
        message: 'Workspace information refreshed successfully',
        teamName: updatedWorkspace.teamName
    };
});
