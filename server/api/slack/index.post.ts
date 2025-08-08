import { NaturalLanguageToRequirementService, SlackService } from '~/server/data/services'
import { createSlackEventInteractor } from '~/application/slack'
import { slackBodySchema } from '~/server/data/slack-zod-schemas'
import handleDomainException from '~/server/utils/handleDomainException'
import { resolveSlackUserSession } from '~/server/utils/resolveSlackUser'

const config = useRuntimeConfig(),
    slackService = new SlackService(config.slackBotToken, config.slackSigningSecret),
    nlrService = new NaturalLanguageToRequirementService({
        apiKey: config.azureOpenaiApiKey,
        apiVersion: config.azureOpenaiApiVersion,
        endpoint: config.azureOpenaiEndpoint,
        deployment: config.azureOpenaiDeploymentId
    })

export default defineEventHandler(async (event) => {
    try {
        const rawBody = (await readRawBody(event))!,
            data = await validateEventBody(event, slackBodySchema),
            headers = event.headers

        let slackUserId = '',
            teamId = ''

        if (data.type === 'event_callback' && data.event) {
            if ('user' in data.event) {
                slackUserId = data.event.user || ''
            }
            teamId = data.authorizations?.[0]?.team_id || ''
        }

        const userSession = slackUserId ? await resolveSlackUserSession(event, slackUserId, teamId) : null

        // For url_verification, we don't need user authentication
        if (data.type === 'url_verification') {
            // Create minimal session for url_verification
            const verificationSession = {
                    id: 'url-verification',
                    user: {
                        id: 'url-verification',
                        name: 'URL Verification',
                        email: 'verification@cathedral.local',
                        isSystemAdmin: false,
                        organizationRoles: []
                    },
                    loggedInAt: Date.now()
                },
                eventInteractor = createSlackEventInteractor({
                    em: event.context.em,
                    session: verificationSession,
                    slackService,
                    nlrService
                })

            return eventInteractor.handleEvent(data).catch(handleDomainException)
        }

        // For event_callback (like app mentions), we need user authentication
        if (!userSession) {
            console.warn(`Slack event from unlinked user ${slackUserId} in team ${teamId} - ignoring`)
            // Return success to prevent Slack retries, but don't process the event
            return { challenge: 'user_not_linked' }
        }

        const eventInteractor = createSlackEventInteractor({
            em: event.context.em,
            session: userSession,
            slackService,
            nlrService
        })

        slackService.assertValidSlackRequest(headers, rawBody)

        return eventInteractor.handleEvent(data).catch(handleDomainException)
    } catch {
        // Handle domain exceptions properly, but note that Slack expects 200 responses
        // to prevent retries, so we catch and log but still return success
        return { challenge: 'error_handled' }
    }
})
