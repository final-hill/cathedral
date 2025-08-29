import { WebClient } from '@slack/web-api'
import crypto from 'crypto'
import { z } from 'zod'
import type {
    SlackResponseMessage,
    OrganizationData,
    SolutionData,
    SlackBlock
} from '~/server/data/slack-zod-schemas'

export class SlackService {
    private client: WebClient
    private slackSigningSecret: string

    constructor(token: string, slackSigningSecret: string) {
        this.client = new WebClient(token)
        this.slackSigningSecret = slackSigningSecret
    }

    async postMessage({ channel, text, thread_ts, blocks }: {
        channel: string
        text: string
        thread_ts?: string
        blocks?: SlackBlock[]
    }) {
        return this.client.chat.postMessage({
            channel,
            text,
            thread_ts,
            blocks
        })
    }

    /**
     * Post a response to a Slack response URL (used for interactive callbacks)
     * Response URLs are webhook endpoints provided by Slack for responding to interactive components
     * and must be called within 3 seconds of receiving the original request.
     * @param responseUrl - The response URL provided by Slack in the interactive payload
     * @param payload - The response payload to send (should match Slack's response format)
     * @returns Promise that resolves when the response is posted successfully
     * @throws Error if the request fails or times out
     */
    async postToResponseUrl(responseUrl: string, payload: SlackResponseMessage): Promise<void> {
        try {
            const response = await fetch(responseUrl, {
                method: 'POST',
                headers: {
                    'content-type': 'application/json',
                    'user-agent': 'Cathedral-Slack-Bot/1.0'
                },
                body: JSON.stringify(payload)
            })

            if (!response.ok) {
                const errorText = await response.text().catch(() => 'Unknown error')
                throw createError({
                    statusCode: response.status,
                    statusMessage: `Failed to post to Slack response URL`,
                    message: `HTTP ${response.status}: ${errorText}`
                })
            }
        } catch (error) {
            // Re-throw createError instances (they have statusCode property)
            if (error && typeof error === 'object' && 'statusCode' in error) throw error

            throw createError({
                statusCode: 500,
                statusMessage: 'Internal Server Error',
                message: `Failed to post to Slack response URL: ${error instanceof Error ? error.message : 'Unknown error'}`
            })
        }
    }

    /**
     * Create a dropdown selection message for organization selection
     * @param organizations - Array of organizations with id and name
     * @param actionId - The action ID for the dropdown
     * @returns Slack message payload with dropdown
     */
    createOrganizationDropdown(organizations: OrganizationData[], actionId: string = 'cathedral_link_org_select'): SlackResponseMessage {
        const options = organizations.map(org => ({
            text: { type: 'plain_text' as const, text: org.name, emoji: true },
            value: org.id
        }))

        return {
            response_type: 'ephemeral' as const,
            text: '',
            blocks: [
                {
                    type: 'section' as const,
                    text: { type: 'mrkdwn' as const, text: '*Select a Cathedral organization to link this channel:*' },
                    accessory: {
                        type: 'static_select' as const,
                        placeholder: { type: 'plain_text' as const, text: 'Select an organization', emoji: true },
                        options,
                        action_id: actionId
                    }
                }
            ]
        }
    }

    /**
     * Create a dropdown selection message for solution selection
     * @param solutions - Array of solutions with id, name, and organizationId
     * @param organizationId - The organization ID to include in the option values
     * @param actionId - The action ID for the dropdown
     * @param replaceOriginal - Whether this should replace the original message
     * @returns Slack message payload with dropdown
     */
    createSolutionDropdown(
        solutions: SolutionData[],
        organizationId: string,
        actionId: string = 'cathedral_link_solution_select',
        replaceOriginal: boolean = true
    ): SlackResponseMessage {
        const options = solutions.slice(0, 100).map(sol => ({
                text: { type: 'plain_text' as const, text: sol.name, emoji: true },
                value: `${organizationId}:${sol.id}`
            })),
            payload: SlackResponseMessage = {
                response_type: 'ephemeral' as const,
                text: 'Select a Cathedral solution to link this channel:',
                blocks: [
                    {
                        type: 'section' as const,
                        text: {
                            type: 'mrkdwn' as const,
                            text: '*Select a Cathedral solution to link this channel:*'
                        },
                        accessory: {
                            type: 'static_select' as const,
                            placeholder: {
                                type: 'plain_text' as const,
                                text: 'Select a solution',
                                emoji: true
                            },
                            options,
                            action_id: actionId
                        }
                    }
                ]
            }

        if (replaceOriginal)
            payload.replace_original = true

        return payload
    }

    /**
     * Create a success message for channel linking
     * @param solutionName - Name of the solution that was linked
     * @param replaceOriginal - Whether this should replace the original message
     * @returns Slack message payload
     */
    createChannelLinkSuccessMessage(solutionName: string, replaceOriginal: boolean = true): SlackResponseMessage {
        const payload: SlackResponseMessage = {
            response_type: 'in_channel' as const,
            text: `This Slack channel is now linked to Cathedral solution: *${solutionName}*.`
        }

        if (replaceOriginal)
            payload.replace_original = true

        return payload
    }

    /**
     * Create an error message for interactive responses
     * @param message - The error message to display
     * @returns Slack message payload
     */
    createErrorMessage(message: string): SlackResponseMessage {
        return {
            response_type: 'ephemeral' as const,
            text: message
        }
    }

    /**
     * Create a help message for slash commands
     * @returns Slack message payload with help text
     */
    createHelpMessage(): SlackResponseMessage {
        return {
            response_type: 'ephemeral' as const,
            text: [
                '*Cathedral Slack Commands:*',
                '`/cathedral` or `/cathedral-help`: Show this help message',
                '`/cathedral-link-user`: Link your Slack user to a Cathedral user',
                '`/cathedral-unlink-user`: Unlink your Slack user from a Cathedral user',
                '`/cathedral-link-solution`: Link this channel to a Cathedral solution',
                '`/cathedral-unlink-solution`: Unlink this channel from a Cathedral solution'
            ].join('\n')
        }
    }

    /**
     * Create a user link message with authentication URL
     * @param userId - The Slack user ID
     * @param authUrl - The authentication URL for linking
     * @returns Slack message payload with link
     */
    createUserLinkMessage(userId: string, authUrl: string): SlackResponseMessage {
        return {
            response_type: 'ephemeral' as const,
            text: `Hi <@${userId}>, I need to connect your Slack account to the Cathedral requirements app. Click here to link your account: ${authUrl}.`
        }
    }

    /**
     * Create a user unlink success message
     * @returns Slack message payload
     */
    createUserUnlinkSuccessMessage(): SlackResponseMessage {
        return {
            response_type: 'ephemeral' as const,
            text: 'Your Slack user has been unlinked from your Cathedral account.'
        }
    }

    /**
     * Create a channel unlink success message
     * @returns Slack message payload
     */
    createChannelUnlinkSuccessMessage(): SlackResponseMessage {
        return {
            response_type: 'in_channel' as const,
            text: 'This Slack channel is no longer linked to any Cathedral solution.'
        }
    }

    /**
     * Create an unknown command error message
     * @param command - The unknown command that was used
     * @returns Slack message payload
     */
    createUnknownCommandMessage(command: string): SlackResponseMessage {
        return {
            response_type: 'ephemeral' as const,
            text: `Unknown slash command: ${command}`
        }
    }

    /**
     * Create a user link requirement message
     * @returns Slack message payload
     */
    createUserLinkRequiredMessage(): SlackResponseMessage {
        return {
            response_type: 'ephemeral' as const,
            text: 'You must first link your Slack user to a Cathedral user using `/cathedral-link-user`.'
        }
    }

    /**
     * Create a channel not linked message
     * @returns Slack message payload
     */
    createChannelNotLinkedMessage(): SlackResponseMessage {
        return {
            response_type: 'ephemeral' as const,
            text: 'This channel is not currently linked to any Cathedral solution.'
        }
    }

    /**
     * Create a processing error message
     * @returns Slack message payload
     */
    createProcessingErrorMessage(): SlackResponseMessage {
        return {
            response_type: 'ephemeral' as const,
            text: 'An error occurred while processing your selection. Please try again.'
        }
    }

    /**
     * Create an invalid selection message
     * @returns Slack message payload
     */
    createInvalidSelectionMessage(): SlackResponseMessage {
        return {
            response_type: 'ephemeral' as const,
            text: 'Invalid selection. Please try again.'
        }
    }

    /**
     * Create a no solutions available message
     * @returns Slack message payload
     */
    createNoSolutionsMessage(): SlackResponseMessage {
        return {
            response_type: 'ephemeral' as const,
            text: 'No solutions available in this organization.'
        }
    }

    /**
     * Post an interactive response using response_url with fallback to direct response
     * @param responseUrl - The response URL from the interactive payload (optional)
     * @param payload - The message payload to send
     * @returns The payload to return directly, or empty response if posted via response_url
     */
    async postInteractiveResponse(responseUrl: string | undefined, payload: SlackResponseMessage): Promise<SlackResponseMessage> {
        if (responseUrl) {
            try {
                await this.postToResponseUrl(responseUrl, payload)
                return { response_type: 'ephemeral' as const, text: '' } // Return empty response
            } catch (error) {
                console.error('Failed to post to response_url:', error)
                // Fall through to regular response
            }
        }
        return payload
    }

    /**
     * Send a team information error message
     */
    async sendTeamInfoError(channel: string, thread_ts?: string): Promise<void> {
        await this.postMessage({
            channel,
            text: '❌ Unable to determine team information for this request.',
            thread_ts
        })
    }

    /**
     * Send a channel not linked error message
     */
    async sendChannelNotLinkedError(channel: string, thread_ts?: string): Promise<void> {
        await this.postMessage({
            channel,
            text: '❌ This channel is not linked to any Cathedral solution. Please use `/cathedral-link-solution` first.',
            thread_ts
        })
    }

    /**
     * Send a user not linked error message
     */
    async sendUserNotLinkedError(channel: string, thread_ts?: string): Promise<void> {
        await this.postMessage({
            channel,
            text: '❌ Your Slack user is not linked to a Cathedral user. Please use `/cathedral-link-user` first.',
            thread_ts
        })
    }

    /**
     * Send a requirements parsing error message
     */
    async sendParsingError(channel: string, thread_ts?: string): Promise<void> {
        await this.postMessage({
            channel,
            text: '❌ Unable to parse your message as requirements. Please try rephrasing your request or contact support if the issue persists.',
            thread_ts
        })
    }

    /**
     * Send a simple success message when details can't be fetched
     */
    async sendSimpleSuccessMessage(channel: string, thread_ts?: string): Promise<void> {
        await this.postMessage({
            channel,
            text: '✅ Requirements parsed and saved successfully!',
            thread_ts
        })
    }

    /**
     * Send a detailed success message with requirements count and view button
     */
    async sendDetailedSuccessMessage(
        channel: string,
        count: number,
        requirementsUrl: string,
        thread_ts?: string
    ): Promise<void> {
        await this.postMessage({
            channel,
            text: `✅ Successfully parsed and saved *${count}* requirements from your message!`,
            thread_ts,
            blocks: [
                {
                    type: 'section',
                    text: {
                        type: 'mrkdwn',
                        text: `Parsed *${count}* requirements from your message.`
                    }
                },
                {
                    type: 'actions',
                    elements: [
                        {
                            type: 'button',
                            text: {
                                type: 'plain_text',
                                text: 'View Requirements',
                                emoji: true
                            },
                            url: requirementsUrl,
                            action_id: 'view_requirements',
                            style: 'primary'
                        }
                    ]
                }
            ]
        })
    }

    /**
     * Send a generic error message for unexpected errors
     */
    async sendUnexpectedError(channel: string, thread_ts?: string): Promise<void> {
        await this.postMessage({
            channel,
            text: '❌ An unexpected error occurred while processing your request. Please try again or contact support.',
            thread_ts
        }).catch(console.error) // Prevent error loops
    }

    // https://api.slack.com/authentication/verifying-requests-from-slack#validating-a-request
    assertValidSlackRequest(headers: Headers, rawBody: string) {
        const signingSecret = this.slackSigningSecret,
            timestamp = headers.get('X-Slack-Request-Timestamp')!,
            // Prevent replay attacks by checking the timestamp
            // to verify that it does not differ from local time by more than five minutes.
            curTimestamp = Math.floor(Date.now() / 1000),
            reqTimestamp = parseInt(timestamp, 10)

        if (Math.abs(curTimestamp - reqTimestamp) > 300) {
            throw createError({
                statusCode: 403,
                statusMessage: 'Forbidden',
                message: 'Invalid Slack request timestamp'
            })
        }

        const slackSignature = headers.get('X-Slack-Signature')!,
            base = `v0:${timestamp}:${rawBody}`,
            hmac = crypto
                .createHmac('sha256', signingSecret)
                .update(base)
                .digest('hex'),
            computedSignature = `v0=${hmac}`

        if (computedSignature !== slackSignature) {
            throw createError({
                statusCode: 403,
                statusMessage: 'Forbidden',
                message: 'Invalid Slack request signature'
            })
        }
    }

    /**
     * Get channel information from Slack API
     * @param channelId - The Slack channel ID
     * @returns Channel information including name
     */
    async getChannelInfo(channelId: string) {
        try {
            const result = await this.client.conversations.info({
                channel: channelId
            })
            return result.channel
        } catch (error) {
            console.error('Failed to get channel info:', error)
            throw createError({
                statusCode: 500,
                statusMessage: 'Failed to get channel information',
                message: `Could not retrieve channel information for ${channelId}: ${error instanceof Error ? error.message : 'Unknown error'}`
            })
        }
    }

    /**
     * Get team information from Slack API
     * @param teamId - The Slack team ID (optional, uses current team if not provided)
     * @throws Error if the request fails
     * @returns Team information including name
     */
    async getTeamInfo(teamId?: string) {
        try {
            const result = await this.client.team.info({
                ...(teamId && { team: teamId })
            })
            return result.team
        } catch (error) {
            console.error('Failed to get team info:', error)
            throw createError({
                statusCode: 500,
                statusMessage: 'Failed to get team information',
                message: `Could not retrieve team information${teamId ? ` for ${teamId}` : ''}: ${error instanceof Error ? error.message : 'Unknown error'}`
            })
        }
    }

    /**
     * Exchange OAuth authorization code for access token
     * @param props - OAuth exchange parameters
     * @returns OAuth token response from Slack
     */
    static async exchangeOAuthCode(props: {
        clientId: string
        clientSecret: string
        code: string
        redirectUri: string
    }) {
        try {
            const response = await $fetch('https://slack.com/api/oauth.v2.access', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    body: new URLSearchParams({
                        client_id: props.clientId,
                        client_secret: props.clientSecret,
                        code: props.code,
                        redirect_uri: props.redirectUri
                    }).toString()
                }),
                // Validate and parse the response
                responseSchema = z.object({
                    ok: z.boolean(),
                    access_token: z.string().optional(),
                    token_type: z.string().optional(),
                    scope: z.string().optional(),
                    bot_user_id: z.string().optional(),
                    app_id: z.string().optional(),
                    team: z.object({
                        name: z.string(),
                        id: z.string()
                    }).optional(),
                    enterprise: z.object({
                        name: z.string(),
                        id: z.string()
                    }).nullable().optional(),
                    authed_user: z.object({
                        id: z.string(),
                        scope: z.string().optional(),
                        access_token: z.string().optional(),
                        token_type: z.string().optional()
                    }).optional(),
                    error: z.string().optional()
                }),
                tokenData = responseSchema.parse(response)

            if (!tokenData.ok || !tokenData.access_token) {
                console.error('Slack OAuth token exchange failed:', tokenData.error)
                throw createError({
                    statusCode: 400,
                    statusMessage: `Slack OAuth failed: ${tokenData.error || 'Unknown error'}`
                })
            }

            return tokenData
        } catch (error) {
            console.error('Failed to exchange OAuth code:', error)
            throw createError({
                statusCode: 500,
                statusMessage: 'Failed to exchange OAuth code',
                message: `OAuth token exchange failed: ${error instanceof Error ? error.message : 'Unknown error'}`
            })
        }
    }

    /**
     * Generate Slack OAuth authorization URL
     * @param props - OAuth authorization parameters
     * @returns The complete OAuth authorization URL for redirecting users
     */
    static generateOAuthAuthorizationUrl(props: {
        clientId: string
        redirectUri: string
        state: string
        scopes?: string[]
    }): string {
        const { clientId, redirectUri, state, scopes } = props,
            // Default scopes for Cathedral Slack integration
            defaultScopes = [
                'app_mentions:read',
                'channels:read',
                'chat:write',
                'commands',
                'groups:read',
                'im:history',
                'im:read',
                'im:write',
                'mpim:write',
                'team:read'
            ],
            slackAuthUrl = new URL('https://slack.com/oauth/v2/authorize')
        slackAuthUrl.searchParams.set('client_id', clientId)
        slackAuthUrl.searchParams.set('scope', (scopes || defaultScopes).join(','))
        slackAuthUrl.searchParams.set('redirect_uri', redirectUri)
        slackAuthUrl.searchParams.set('state', state)

        return slackAuthUrl.toString()
    }

    /**
     * Generate OAuth state parameter with CSRF protection
     * @param props - State generation parameters
     * @returns Base64 encoded state parameter
     */
    static generateOAuthState(props: {
        organizationSlug: string
        additionalData?: Record<string, unknown>
    }): string {
        const { organizationSlug, additionalData = {} } = props,
            stateData = {
                organizationSlug,
                timestamp: Date.now(),
                nonce: Math.random().toString(36).substring(2, 15),
                ...additionalData
            }

        return btoa(JSON.stringify(stateData))
    }
}
