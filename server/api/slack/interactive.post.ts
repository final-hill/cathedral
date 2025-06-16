import { NaturalLanguageToRequirementService, SlackService } from "~/server/data/services";
import { PermissionInteractor } from "~/application";
import { SlackRepository, PermissionRepository } from '~/server/data/repositories';
import { SlackInteractor } from "~/application/SlackInteractor";
import { SYSTEM_SLACK_USER_ID } from "~/shared/constants.js";
import validateEventBody from '~/server/utils/validateEventBody';
import { z } from "zod";
import { slackInteractivePayloadSchema } from '~/server/data/slack-zod-schemas';

const config = useRuntimeConfig();

const slackService = new SlackService(config.slackBotToken, config.slackSigningSecret),
    nlrService = new NaturalLanguageToRequirementService({
        apiKey: config.azureOpenaiApiKey,
        apiVersion: config.azureOpenaiApiVersion,
        endpoint: config.azureOpenaiEndpoint,
        deployment: config.azureOpenaiDeploymentId
    })

const slackInteractiveOuterSchema = z.object({ payload: z.string() });

/**
 * Slack interactive endpoint for Block Kit actions (e.g., solution select menu)
 * Handles POST requests from Slack's Interactivity feature
 */
export default defineEventHandler(async (event) => {
    const headers = event.headers,
        rawBody = (await readRawBody(event))!;

    slackService.assertValidSlackRequest(headers, rawBody);

    // Slack sends the payload as application/x-www-form-urlencoded with a 'payload' key containing a JSON string.
    // We first validate the outer form, then parse the JSON string, then validate the inner payload.
    const { payload: payloadStr } = await validateEventBody(event, slackInteractiveOuterSchema);
    const payload = slackInteractivePayloadSchema.parse(JSON.parse(payloadStr));

    const slackInteractor = new SlackInteractor({
        repository: new SlackRepository({ em: event.context.em }),
        permissionInteractor: new PermissionInteractor({
            userId: SYSTEM_SLACK_USER_ID,
            repository: new PermissionRepository({ em: event.context.em })
        }),
        // TODO: this smells. The service is unused in this handler, but is required for the constructor.
        nlrService,
        slackService
    });

    if (payload.type === 'block_actions') {
        const actionId = payload.actions?.[0]?.action_id;

        console.log('Received Slack interactive action:', actionId, payload);

        try {
            if (actionId === 'cathedral_link_org_select') {
                const result = await slackInteractor.handleOrganizationSelectCallback(payload);
                console.log('Organization callback result:', JSON.stringify(result, null, 2));
                
                // Ensure proper content type for Slack
                setHeader(event, 'content-type', 'application/json');
                return result;
            } else if (actionId === 'cathedral_link_solution_select') {
                const result = await slackInteractor.handleSolutionSelectCallback(payload);
                console.log('Solution callback result:', JSON.stringify(result, null, 2));
                
                // Ensure proper content type for Slack
                setHeader(event, 'content-type', 'application/json');
                return result;
            }
        } catch (error) {
            console.error('Error handling Slack interactive action:', error);
            setHeader(event, 'content-type', 'application/json');
            return {
                response_type: 'ephemeral',
                text: 'An error occurred while processing your request. Please try again.'
            };
        }
    }

    return {
        response_type: 'ephemeral',
        text: 'Unsupported Slack interactive action.'
    };
});
