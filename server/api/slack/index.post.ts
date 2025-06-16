import { NaturalLanguageToRequirementService, SlackService } from "~/server/data/services";
import { SlackRepository, PermissionRepository } from '~/server/data/repositories';
import { SlackInteractor, PermissionInteractor } from "~/application";
import { SYSTEM_SLACK_USER_ID } from "~/shared/constants.js";
import { slackBodySchema } from "~/server/data/slack-zod-schemas";

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
            headers = event.headers,
            em = event.context.em,
            slackInteractor = new SlackInteractor({
                repository: new SlackRepository({ em }),
                permissionInteractor: new PermissionInteractor({
                    userId: SYSTEM_SLACK_USER_ID,
                    repository: new PermissionRepository({ em })
                }),
                nlrService,
                slackService
            });

        slackService.assertValidSlackRequest(headers, rawBody)

        return slackInteractor.handleEvent(data)
    } catch (error) {
        // Log the full error for debugging
        console.error('Slack webhook error:', error);
        
        // Return a minimal error response to Slack
        // Note: Slack expects a 200 response even for errors to prevent retries
        throw createError({
            statusCode: 200,
            statusMessage: 'Internal server error'
        });
    }
});