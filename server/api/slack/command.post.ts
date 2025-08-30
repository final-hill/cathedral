import { SlackService } from '~~/server/data/services'
import { createSlackEventInteractor } from '~~/server/application/slack'
import { NaturalLanguageToRequirementService } from '~~/server/data/services/NaturalLanguageToRequirementService'
import { slackSlashCommandSchema } from '~~/server/data/slack-zod-schemas'

const config = useRuntimeConfig(),
    slackService = new SlackService(config.slackBotToken, config.slackSigningSecret),
    nlrService = new NaturalLanguageToRequirementService({
        apiKey: config.azureOpenaiApiKey,
        apiVersion: config.azureOpenaiApiVersion,
        endpoint: config.azureOpenaiEndpoint,
        deployment: config.azureOpenaiDeploymentId
    })

/**
 * Slack slash command endpoint for /cathedral
 * Responds with a simple message for verification
 */
export default defineEventHandler(async (event) => {
    const headers = event.headers,
        rawBody = (await readRawBody(event))!

    slackService.assertValidSlackRequest(headers, rawBody)

    const body = await validateEventBody(event, slackSlashCommandSchema),
        userSession = await resolveSlackUserSession(event, body.user_id, body.team_id),
        // For most slash commands, we need a valid user session
        // However, some commands like help and link-user can work without authentication
        requiresAuth = !['cathedral', 'cathedral-help', 'cathedral-link-user'].includes(body.command)

    if (requiresAuth && !userSession) {
        return {
            response_type: 'ephemeral',
            text: '❌ You must link your Slack account to Cathedral first. Use `/cathedral-link-user` to get started.'
        }
    }

    // Use resolved session or create a minimal session for non-authenticated commands
    const sessionToUse = userSession || {
            id: `slack-${body.user_id}`, // Temporary ID for unlinked users
            user: {
                id: `slack-${body.user_id}`,
                name: 'Unlinked Slack User',
                email: `${body.user_id}@slack.local`,
                isSystemAdmin: false,
                organizationRoles: []
            },
            loggedInAt: Date.now()
        },
        eventInteractor = createSlackEventInteractor({
            em: event.context.em,
            session: sessionToUse,
            slackService,
            nlrService
        })

    return eventInteractor.handleSlashCommand(body).catch(handleDomainException)
})
