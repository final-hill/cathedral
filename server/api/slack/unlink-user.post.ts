import { z } from 'zod'
import { PermissionInteractor } from '~/application'
import { SlackRepository } from '~/server/data/repositories'
import handleDomainException from '~/server/utils/handleDomainException'
import { createEntraGroupService } from '~/server/utils/createEntraGroupService'
import { PermissionDeniedException } from '#shared/domain'

const bodySchema = z.object({
    slackUserId: z.string().min(1).describe('The Slack user ID to unlink'),
    teamId: z.string().min(1).describe('The Slack team/workspace ID')
})

/**
 * Unlink a Slack user from their Cathedral account (admin interface)
 */
export default defineEventHandler(async (event) => {
    const { slackUserId, teamId } = await validateEventBody(event, bodySchema),
        session = await requireUserSession(event),
        permissionInteractor = new PermissionInteractor({
            event,
            session,
            groupService: createEntraGroupService()
        }),
        slackRepository = new SlackRepository({ em: event.context.em })

    // Only system admins can unlink users via the admin interface
    if (!permissionInteractor.isSystemAdmin()) {
        throw new PermissionDeniedException('Forbidden: Only system administrators can unlink Slack users.')
    }

    return await slackRepository.unlinkSlackUser({ slackUserId, teamId })
        .catch(handleDomainException)
})
