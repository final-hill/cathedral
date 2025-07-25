import { z } from 'zod'
import { OrganizationRepository } from '~/server/data/repositories'
import { SlackService } from '~/server/data/services'
import { createSlackWorkspaceInteractor } from '~/application/slack/factory'

const querySchema = z.object({
    code: z.string().optional(),
    state: z.string().min(1, 'State parameter is required'),
    error: z.string().optional(),
    error_description: z.string().optional()
})

/**
 * Slack OAuth callback endpoint
 * This endpoint handles the OAuth callback from Slack and exchanges the code for an access token
 */
export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig(),
        session = await requireUserSession(event),
        { code, state, error, error_description } = await validateEventQuery(event, querySchema),
        em = event.context.em

    if (error) {
        console.error('Slack OAuth error:', error)

        if (error === 'access_denied') {
            const stateData: { organizationSlug: string, timestamp: number, nonce: string }
                = JSON.parse(atob(state))

            // Redirect back to organization page with error message
            const redirectUrl = new URL(`/o/${stateData.organizationSlug}`, config.origin)
            redirectUrl.searchParams.set('slack_install', 'error')
            redirectUrl.searchParams.set('error_message', error_description || 'Access was denied by the user')
            await sendRedirect(event, redirectUrl.toString())

            return
        }

        throw createError({
            statusCode: 400,
            statusMessage: `Slack OAuth error: ${error}`
        })
    }

    if (!code) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Authorization code is required'
        })
    }

    let stateData: { organizationSlug: string, timestamp: number, nonce: string }
    try {
        stateData = JSON.parse(atob(state))
        if (!stateData)
            throw new Error('State data is null')
    } catch {
        throw createError({
            statusCode: 400,
            statusMessage: 'Invalid state parameter'
        })
    }

    // Check state timestamp to prevent replay attacks (valid for 10 minutes)
    if (Date.now() - stateData.timestamp > 10 * 60 * 1000) {
        throw createError({
            statusCode: 400,
            statusMessage: 'OAuth state expired'
        })
    }

    // Exchange authorization code for access token using SlackService
    const slackOAuthOrigin = config.slackOauthOrigin || config.origin
    const tokenData = await SlackService.exchangeOAuthCode({
        clientId: process.env.NUXT_PUBLIC_SLACK_CLIENT_ID!,
        clientSecret: config.slackClientSecret,
        code: code,
        redirectUri: `${slackOAuthOrigin}/api/slack/oauth/callback`
    })

    const orgRepo = new OrganizationRepository({
            em,
            organizationSlug: stateData.organizationSlug
        }),
        organization = await orgRepo.getOrganization()

    const workspaceInteractor = createSlackWorkspaceInteractor({
        em,
        session
    })

    await workspaceInteractor.installWorkspaceForOrganization({
        organizationId: organization.id,
        teamId: tokenData.team!.id,
        teamName: tokenData.team!.name,
        accessToken: tokenData.access_token!,
        botUserId: tokenData.bot_user_id!,
        installedById: session.user.id,
        scope: tokenData.scope || 'commands,chat:write,im:read,im:write,team:read,users:read',
        appId: tokenData.app_id || config.public.slackAppId
    })

    console.log('Slack OAuth successful:', {
        team: tokenData.team,
        organizationSlug: stateData.organizationSlug,
        botUserId: tokenData.bot_user_id,
        appId: tokenData.app_id,
        installedBy: session.user.id
    })

    // Redirect back to the organization page with success message
    const redirectUrl = new URL(`/o/${stateData.organizationSlug}`, config.origin)
    redirectUrl.searchParams.set('slack_install', 'success')
    await sendRedirect(event, redirectUrl.toString())
})
