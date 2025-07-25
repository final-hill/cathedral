import { NaturalLanguageToRequirementService, SlackService } from '~/server/data/services'
import { createSlackEventInteractor } from '~/application/slack'
import validateEventBody from '~/server/utils/validateEventBody'
import { z } from 'zod'
import { slackInteractivePayloadSchema } from '~/server/data/slack-zod-schemas'
import handleDomainException from '~/server/utils/handleDomainException'

const config = useRuntimeConfig()

const slackService = new SlackService(config.slackBotToken, config.slackSigningSecret),
    nlrService = new NaturalLanguageToRequirementService({
        apiKey: config.azureOpenaiApiKey,
        apiVersion: config.azureOpenaiApiVersion,
        endpoint: config.azureOpenaiEndpoint,
        deployment: config.azureOpenaiDeploymentId
    })

const slackInteractiveOuterSchema = z.object({ payload: z.string() })

/**
 * Slack interactive endpoint for Block Kit actions (e.g., solution select menu)
 * Handles POST requests from Slack's Interactivity feature
 */
export default defineEventHandler(async (event) => {
    const headers = event.headers,
        rawBody = (await readRawBody(event))!

    slackService.assertValidSlackRequest(headers, rawBody)

    // Slack sends the payload as application/x-www-form-urlencoded with a 'payload' key containing a JSON string.
    // We first validate the outer form, then parse the JSON string, then validate the inner payload.
    const { payload: payloadStr } = await validateEventBody(event, slackInteractiveOuterSchema)
    const payload = slackInteractivePayloadSchema.parse(JSON.parse(payloadStr))

    const eventInteractor = createSlackEventInteractor({
        em: event.context.em,
        session: {
            id: config.systemSlackUserId as string,
            user: {
                id: config.systemSlackUserId as string,
                name: config.systemSlackUserName as string,
                email: config.systemSlackUserEmail as string,
                groups: []
            },
            loggedInAt: Date.now()
        },
        slackService,
        nlrService
    })

    if (payload.type === 'block_actions') {
        const actionId = payload.actions?.[0]?.action_id

        if (actionId === 'cathedral_link_org_select') {
            const result = await eventInteractor.handleOrganizationSelectCallback(payload)
                .catch(handleDomainException)
            setHeader(event, 'content-type', 'application/json')
            return result
        } else if (actionId === 'cathedral_link_solution_select') {
            const result = await eventInteractor.handleSolutionSelectCallback(payload)
                .catch(handleDomainException)
            setHeader(event, 'content-type', 'application/json')
            return result
        }
    }

    return {
        response_type: 'ephemeral',
        text: 'Unsupported Slack interactive action.'
    }
})
