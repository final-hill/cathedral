import { z } from 'zod'
import { SlackService } from '~~/server/data/services'

const querySchema = z.object({
    organizationSlug: z.string().min(1, 'Organization slug is required')
})

/**
 * Slack OAuth authorization redirect endpoint
 * This endpoint generates the OAuth authorization URL and redirects users to Slack
 */
export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig(),
        { organizationSlug } = await validateEventQuery(event, querySchema),
        state = SlackService.generateOAuthState({
            organizationSlug
        }),
        // Use process.env directly for client ID to avoid Nuxt's automatic number parsing
        clientId = process.env.NUXT_PUBLIC_SLACK_CLIENT_ID!,
        // Use Slack-specific origin for OAuth redirect (supports ngrok tunneling)
        slackOAuthOrigin = config.slackOauthOrigin || config.origin,
        slackAuthUrl = SlackService.generateOAuthAuthorizationUrl({
            clientId,
            redirectUri: `${slackOAuthOrigin}/api/slack/oauth/callback`,
            state
        })

    await sendRedirect(event, slackAuthUrl)
})
