import { SlackService } from '~/server/data/services'
import { createSlackEventInteractor } from '~/application/slack'
import { NaturalLanguageToRequirementService } from '~/server/data/services/NaturalLanguageToRequirementService'
import { slackSlashCommandSchema } from '~/server/data/slack-zod-schemas'
import handleDomainException from '~/server/utils/handleDomainException'

const config = useRuntimeConfig()

const slackService = new SlackService(config.slackBotToken, config.slackSigningSecret)
const nlrService = new NaturalLanguageToRequirementService({
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

    const body = await validateEventBody(event, slackSlashCommandSchema)

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

    return eventInteractor.handleSlashCommand(body).catch(handleDomainException)
})
