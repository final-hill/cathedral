import { z } from 'zod'
import { useRuntimeConfig } from '#imports'
import jwt from 'jsonwebtoken'
import { PermissionInteractor, SlackUserInteractor } from '~~/server/application/'
import { SlackRepository } from '~~/server/data/repositories'
import { SlackService } from '~~/server/data/services'

const { verify } = jwt,
    bodySchema = z.object({
        slackUserId: z.string(),
        teamId: z.string(),
        token: z.string()
    })

/**
 * Link a Slack user to a Cathedral user after authentication
 */
export default defineEventHandler(async (event) => {
    const { slackUserId, teamId, token } = await validateEventBody(event, bodySchema),
        session = await requireUserSession(event),
        config = useRuntimeConfig(),
        em = event.context.em,
        entraService = createEntraService(),
        userPermissionInteractor = new PermissionInteractor({
            event,
            session,
            entraService
        }),
        slackUserInteractor = new SlackUserInteractor({
            repository: new SlackRepository({ em }),
            permissionInteractor: userPermissionInteractor,
            slackService: new SlackService(config.slackBotToken, config.slackSigningSecret)
        }),
        payload = verify(token, config.slackLinkSecret)

    if (typeof payload === 'string' || !payload || typeof payload !== 'object') handleDomainException('Invalid token payload')

    // Type assertion after validation
    const jwtPayload = payload as jwt.JwtPayload & { slackUserId: string }

    if (jwtPayload.slackUserId !== slackUserId) handleDomainException('Token mismatch')

    await slackUserInteractor.linkUser({
        slackUserId,
        teamId,
        cathedralUserId: session.user.id,
        createdById: session.user.id,
        creationDate: new Date()
    }).catch(handleDomainException)

    return { message: 'Slack user linked successfully.' }
})
