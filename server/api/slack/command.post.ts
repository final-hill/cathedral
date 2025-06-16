import { SlackService } from "~/server/data/services";
import { PermissionInteractor } from "~/application";
import { SlackRepository, PermissionRepository } from '~/server/data/repositories';
import { SlackInteractor } from "~/application/SlackInteractor";
import { SYSTEM_SLACK_USER_ID } from "~/shared/constants.js";
import { NaturalLanguageToRequirementService } from "~/server/data/services/NaturalLanguageToRequirementService";
import { slackSlashCommandSchema } from "~/server/data/slack-zod-schemas";

const config = useRuntimeConfig();

const slackService = new SlackService(config.slackBotToken, config.slackSigningSecret);
const nlrService = new NaturalLanguageToRequirementService({
    apiKey: config.azureOpenaiApiKey,
    apiVersion: config.azureOpenaiApiVersion,
    endpoint: config.azureOpenaiEndpoint,
    deployment: config.azureOpenaiDeploymentId
});

/**
 * Slack slash command endpoint for /cathedral
 * Responds with a simple message for verification
 */
export default defineEventHandler(async (event) => {
    const headers = event.headers,
        rawBody = (await readRawBody(event))!;

    slackService.assertValidSlackRequest(headers, rawBody);

    const body = await validateEventBody(event, slackSlashCommandSchema);

    const slackInteractor = new SlackInteractor({
        repository: new SlackRepository({ em: event.context.em }),
        permissionInteractor: new PermissionInteractor({
            userId: SYSTEM_SLACK_USER_ID,
            repository: new PermissionRepository({ em: event.context.em })
        }),
        nlrService,
        slackService
    });

    return slackInteractor.handleSlashCommand(body);
});