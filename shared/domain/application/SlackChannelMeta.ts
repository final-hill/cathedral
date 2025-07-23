import { z } from 'zod'

export const SlackChannelMeta = z.object({
    channelId: z.string().describe('The unique identifier for the Slack channel'),
    channelName: z.string().describe('The human-readable name of the Slack channel'),
    teamId: z.string().describe('The unique identifier for the Slack team'),
    teamName: z.string().describe('The human-readable name of the Slack team/workspace'),
    solutionId: z.string().describe('The unique identifier for the solution associated with this channel'),
    createdById: z.string().describe('The unique identifier for the user who created this Slack channel meta entry'),
    createdByName: z.string().optional().describe('The name of the user who created this Slack channel meta entry'),
    creationDate: z.date().describe('The date and time when this Slack channel meta entry was created'),
    lastNameRefresh: z.date().optional().describe('The date and time when channel and team names were last refreshed from Slack'),
    isStale: z.boolean().describe('Whether the channel/team names are considered stale and need refreshing')
}).describe('Metadata for a Slack channel associated with a solution in the application context')

export type SlackChannelMetaType = z.infer<typeof SlackChannelMeta>

/**
 * Type for repository operations - excludes calculated properties like isStale
 */
export type SlackChannelMetaRepositoryType = Omit<SlackChannelMetaType, 'isStale'>
