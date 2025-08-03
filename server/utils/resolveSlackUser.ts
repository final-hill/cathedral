import type { H3Event } from 'h3'
import { SlackRepository } from '~/server/data/repositories'
import { createEntraGroupService } from './createEntraGroupService'
import type { UserSession } from '#auth-utils'

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
        const slackRepository = new SlackRepository({ em: event.context.em })

        const cathedralUserId = await slackRepository.getCathedralUserIdForSlackUser({
            slackUserId,
            teamId
        })

        if (!cathedralUserId) {
            return null // User not linked to Cathedral
        }

        const groupService = createEntraGroupService(),
            userInfo = await groupService.getUser(cathedralUserId),
            userGroups = await groupService.getUserGroupsDirect(cathedralUserId),
            parsedPermissions = groupService.parseGroups(userGroups)

        console.log(`Resolved Slack user ${slackUserId} to Cathedral user ${cathedralUserId} with ${parsedPermissions.organizationRoles.length} org roles, isSystemAdmin: ${parsedPermissions.isSystemAdmin}`)

        const userSession: UserSession = {
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
