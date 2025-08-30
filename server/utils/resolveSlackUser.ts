import type { H3Event } from 'h3'
import { createEntraService } from './createEntraService'
import type { UserSession } from '#auth-utils'
import { SlackRepository } from '../data/repositories'

/**
 * Resolves a Slack user to a Cathedral user session
 * This should be called at the API boundary to establish user identity early
 */
export async function resolveSlackUserSession(
    event: H3Event,
    slackUserId: string,
    teamId: string
): Promise<UserSession | null> {
    try {
        const slackRepository = new SlackRepository({ em: event.context.em }),
            cathedralUserId = await slackRepository.getCathedralUserIdForSlackUser({
                slackUserId,
                teamId
            })

        if (!cathedralUserId)
            return null // User not linked to Cathedral

        const entraService = createEntraService(),
            userInfo = await entraService.getUser(cathedralUserId),
            userGroups = await entraService.getUserGroupsDirect(cathedralUserId),
            parsedPermissions = entraService.parseGroups(userGroups),
            userSession: UserSession = {
                id: cathedralUserId,
                user: {
                    id: cathedralUserId,
                    name: userInfo.name,
                    email: userInfo.email,
                    isSystemAdmin: parsedPermissions.isSystemAdmin,
                    organizationRoles: parsedPermissions.organizationRoles
                },
                loggedInAt: Date.now()
            }

        return userSession
    } catch (error) {
        console.error('Failed to resolve Slack user to Cathedral session:', error)
        return null
    }
}
