import { z } from 'zod'

export const SlackWorkspaceMeta = z.object({
    teamId: z.string().describe('The unique identifier for the Slack team/workspace'),
    teamName: z.string().describe('The human-readable name of the Slack team/workspace'),
    organizationId: z.uuid().describe('The Cathedral organization ID associated with this Slack workspace'),
    organizationName: z.string().describe('The name of the Cathedral organization'),
    accessToken: z.string().describe('The OAuth access token for the Slack workspace'),
    botUserId: z.string().describe('The bot user ID in the Slack workspace'),
    scope: z.string().describe('The OAuth scopes granted to the application'),
    appId: z.string().describe('The Slack app ID'),
    installedById: z.uuid().describe('The Cathedral user ID who installed the app'),
    installedByName: z.string().optional().describe('The name of the Cathedral user who installed the app'),
    installationDate: z.date().describe('The date and time when the app was installed in the workspace'),
    lastRefreshDate: z.date().optional().describe('The date and time when the workspace info was last refreshed')
}).describe('Metadata for a Slack workspace integration with a Cathedral organization')

export type SlackWorkspaceMetaType = z.infer<typeof SlackWorkspaceMeta>

/**
 * Type for repository operations - excludes the access token for security
 */
export type SlackWorkspaceMetaPublicType = Omit<SlackWorkspaceMetaType, 'accessToken'>
