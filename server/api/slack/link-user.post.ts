import { z } from 'zod';
import { useRuntimeConfig } from '#imports';
import jwt from 'jsonwebtoken';
import { Slack, PermissionInteractor } from '~/application/';
import { SlackRepository, PermissionRepository } from '~/server/data/repositories';
import { SlackService } from "~/server/data/services";
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
        session = await requireUserSession(event),
        config = useRuntimeConfig(),
        em = event.context.em

    const userPermissionInteractor = new PermissionInteractor({
        userId: session.user.id,
        repository: new PermissionRepository({ em }),
    });

    const slackUserInteractor = new Slack.SlackUserInteractor({
        repository: new SlackRepository({ em }),
        permissionInteractor: new PermissionInteractor({
            userId: SYSTEM_SLACK_USER_ID,
            repository: new PermissionRepository({ em })
        }),
        slackService: new SlackService(config.slackBotToken, config.slackSigningSecret)
    });

    const payload = verify(token, config.slackLinkSecret);

    if (typeof payload === 'string' || !payload || typeof payload !== 'object')
        handleDomainException('Invalid token payload');

    if (payload.slackUserId !== slackUserId)
        handleDomainException('Token mismatch');

    await slackUserInteractor.linkSlackUserAsUser({
        slackUserId,
        teamId,
        cathedralUserId: session.user.id,
        createdById: session.user.id,
        creationDate: new Date(),
    }, userPermissionInteractor).catch(handleDomainException);

    return { message: 'Slack user linked successfully.' };
});
