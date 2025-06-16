import { z } from 'zod';
import { useRuntimeConfig } from '#imports';
import jwt from 'jsonwebtoken';
import { SlackInteractor, PermissionInteractor } from '~/application/';
import { SlackRepository, PermissionRepository } from '~/server/data/repositories';
import { NaturalLanguageToRequirementService, SlackService } from "~/server/data/services";
import { SYSTEM_SLACK_USER_ID } from "~/shared/constants.js";
import handleDomainException from '~/server/utils/handleDomainException';

const { verify } = jwt;

const bodySchema = z.object({
    slackUserId: z.string(),
    teamId: z.string(),
    token: z.string(),
});

/**
 * Link a Slack user to a Cathedral user after authentication
 */
export default defineEventHandler(async (event) => {
    const { slackUserId, teamId, token } = await validateEventBody(event, bodySchema),
        session = (await requireUserSession(event))!,
        config = useRuntimeConfig(),
        userPermissionInteractor = new PermissionInteractor({
            userId: session.user.id,
            repository: new PermissionRepository({ em: event.context.em }),
        }),
        slackService = new SlackService(config.slackBotToken, config.slackSigningSecret),
        nlrService = new NaturalLanguageToRequirementService({
            apiKey: config.azureOpenaiApiKey,
            apiVersion: config.azureOpenaiApiVersion,
            endpoint: config.azureOpenaiEndpoint,
            deployment: config.azureOpenaiDeploymentId
        }),
        slackInteractor = new SlackInteractor({
            repository: new SlackRepository({ em: event.context.em }),
            permissionInteractor: new PermissionInteractor({
                userId: SYSTEM_SLACK_USER_ID,
                repository: new PermissionRepository({ em: event.context.em })
            }),
            nlrService,
            slackService
        });

    let payload: any;
    try {
        payload = verify(token, config.slackLinkSecret);
        if (payload.slackUserId !== slackUserId) throw new Error('Token mismatch');
    } catch (e: any) {
        return handleDomainException(createError({ statusCode: 401, message: 'Invalid or expired token.' }));
    }

    try {
        await slackInteractor.linkSlackUserAsUser({
            slackUserId,
            teamId,
            cathedralUserId: session.user.id,
            createdById: session.user.id,
            creationDate: new Date(),
        }, userPermissionInteractor);
        return { message: 'Slack user linked successfully.' };
    } catch (e: any) {
        return handleDomainException(e);
    }
});
