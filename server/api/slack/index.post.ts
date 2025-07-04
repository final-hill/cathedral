import { NaturalLanguageToRequirementService, SlackService } from "~/server/data/services";
import { createSlackEventInteractor } from "~/application/slack";
import { SYSTEM_SLACK_USER_ID } from "~/shared/constants.js";
import { slackBodySchema } from "~/server/data/slack-zod-schemas";
import handleDomainException from "~/server/utils/handleDomainException";

const config = useRuntimeConfig()

const slackService = new SlackService(config.slackBotToken, config.slackSigningSecret),
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
            headers = event.headers;

        const eventInteractor = createSlackEventInteractor({
            em: event.context.em,
            userId: SYSTEM_SLACK_USER_ID,
            slackService,
            nlrService
        });

        slackService.assertValidSlackRequest(headers, rawBody)

        return eventInteractor.handleEvent(data).catch(handleDomainException)
    } catch (error) {
        // Handle domain exceptions properly, but note that Slack expects 200 responses
        // to prevent retries, so we catch and log but still return success
        return { challenge: 'error_handled' };
    }
});