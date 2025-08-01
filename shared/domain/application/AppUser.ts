import { z } from 'zod'
import { AppRole } from './AppRole.js'

export const AppUser = z.object({
    id: z.string().min(1).max(766).readonly().describe('The user identifier'),
    name: z.string().min(1).max(254).describe('The name of the app user'),
    email: z.string().min(1).max(254).email().describe('The email address of the app user'),
    role: z.nativeEnum(AppRole).optional().describe('The role of the app user in the current organization'),
    slackAssociations: z.array(z.object({
        slackUserId: z.string().describe('The Slack user ID'),
        teamId: z.string().describe('The Slack team/workspace ID'),
        teamName: z.string().describe('The name of the Slack workspace'),
        creationDate: z.date().describe('When the association was created')
    })).optional().describe('Slack user associations for this Cathedral user')
}).describe('The users of the application')
