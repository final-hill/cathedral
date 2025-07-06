import { z } from 'zod'

export const SlackUserMeta = z.object({
    slackUserId: z.string().describe('The unique identifier for the Slack user'),
    teamId: z.string().describe('The unique identifier for the Slack team'),
    cathedralUserId: z.string().describe('The unique identifier for the Cathedral user associated with the Slack user'),
    createdById: z.string().describe('The unique identifier for the user who created this Slack user meta entry'),
    creationDate: z.date().describe('The date and time when this Slack user meta entry was created')
}).describe('Metadata for a Slack user associated with a Cathedral user in the application context')

export type SlackUserMetaType = z.infer<typeof SlackUserMeta>
