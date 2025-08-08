import { Interactor } from '../Interactor'
import type { PermissionInteractor } from '../PermissionInteractor'
import type { SlackRepository } from '~/server/data/repositories'
import type { SlackService } from '~/server/data/services'
import type { SlackUserMetaType } from '#shared/domain/application'
import { PermissionDeniedException } from '#shared/domain'
import type { SlackResponseMessage } from '~/server/data/slack-zod-schemas'
import jwt from 'jsonwebtoken'

/**
 * Slack User Interactor
 *
 * Handles user-level operations for Slack integration
 * This interactor manages:
 * - User linking/unlinking between Slack and Cathedral
 * - User authentication and validation
 * - User permission checks and mappings
 */
export class SlackUserInteractor extends Interactor<SlackUserMetaType> {
    protected readonly _permissionInteractor: PermissionInteractor
    protected readonly _slackService: SlackService

    constructor(props: {
        repository: SlackRepository
        permissionInteractor: PermissionInteractor
        slackService: SlackService
    }) {
        super({ repository: props.repository })
        this._permissionInteractor = props.permissionInteractor
        this._slackService = props.slackService
    }

    get repository(): SlackRepository {
        return this._repository as SlackRepository
    }

    /**
     * Link a Slack user to a Cathedral user
     *
     * @param props - User linking parameters
     * @throws {NotFoundException} If the Cathedral user does not exist
     * @throws {DuplicateEntityException} If the link already exists
     * @throws {PermissionDeniedException} If the current user is not the user being linked or a system admin
     */
    async linkUser(props: SlackUserMetaType): Promise<void> {
        const currentUserId = this._permissionInteractor.userId

        if (props.cathedralUserId !== currentUserId && !this._permissionInteractor.isSystemAdmin()) {
            throw new PermissionDeniedException(
                `User with id ${currentUserId} does not have permission to link Slack user to Cathedral user ${props.cathedralUserId}`
            )
        }

        await this.repository.linkSlackUser({
            slackUserId: props.slackUserId,
            cathedralUserId: props.cathedralUserId,
            teamId: props.teamId,
            createdById: currentUserId,
            creationDate: new Date()
        })
    }

    /**
     * Unlink a Slack user from a Cathedral user for a given team (admin/bot operation)
     *
     * @param props - User unlinking parameters
     * @throws {NotFoundException} If the link does not exist
     * @throws {PermissionDeniedException} If the current user is not a system admin
     */
    async unlinkUser(props: { slackUserId: string, teamId: string }): Promise<void> {
        // Only system admins can perform admin-level user unlinking operations
        if (!this._permissionInteractor.isSystemAdmin()) {
            throw new PermissionDeniedException('Only system administrators can unlink users through admin operations')
        }

        await this.repository.unlinkSlackUser(props)
    }

    /**
     * Check if a Slack user is linked to a Cathedral user for a given team
     *
     * @param props - User checking parameters
     * @returns True if the user is linked, false otherwise
     * @throws {PermissionDeniedException} If the current user is not a system admin
     */
    async isSlackUserLinked(props: { slackUserId: string, teamId: string }): Promise<boolean> {
        if (!this._permissionInteractor.isSystemAdmin()) {
            throw new PermissionDeniedException('Only system administrators can check user linking status')
        }

        return this.repository.isSlackUserLinked(props)
    }

    /**
     * Get Cathedral user ID for a Slack user/team combination
     *
     * @param props - Slack user identification parameters
     * @returns Cathedral user ID if linked, null otherwise
     */
    async getCathedralUserIdForSlackUser(props: { slackUserId: string, teamId: string }): Promise<string | null> {
        return this.repository.getCathedralUserIdForSlackUser(props)
    }

    /**
     * Get all Slack user associations for a Cathedral user
     *
     * @param cathedralUserId - The Cathedral user ID
     * @returns Array of Slack user associations
     */
    async getSlackUsersForCathedralUser(cathedralUserId: string): Promise<Array<{
        slackUserId: string
        teamId: string
        teamName: string
        creationDate: Date
    }>> {
        return this.repository.getSlackUsersForCathedralUser(cathedralUserId)
    }

    /**
     * Validate user authentication and return Cathedral user ID
     *
     * Business Rules:
     * - Used internally for message processing and command validation
     * - Sends appropriate error messages to Slack if user not linked
     * - Returns void if validation fails (error already sent)
     *
     * @param slackUserId - The Slack user ID
     * @param channelId - The Slack channel ID (for error messaging)
     * @param teamId - The Slack team ID
     * @param thread_ts - Optional thread timestamp for threaded responses
     * @returns Cathedral user ID if linked, void if not (with error sent)
     */
    async validateUserAuthentication(
        slackUserId: string,
        channelId: string,
        teamId: string,
        thread_ts?: string
    ): Promise<string | undefined> {
        const cathedralUserId = await this.repository
            .getCathedralUserIdForSlackUser({ slackUserId, teamId })
            .catch(() => void 0)

        if (!cathedralUserId) {
            await this._slackService.sendUserNotLinkedError(channelId, thread_ts)
            return undefined
        }

        return cathedralUserId
    }

    /**
     * Create a user link command response
     *
     * Business Rules:
     * - Generates secure JWT token for user linking
     * - Token expires in 10 minutes for security
     * - Redirects through account selection flow for proper user validation
     *
     * @param slackUserId - The Slack user ID
     * @param teamId - The Slack team ID
     * @returns Slack message with authentication link
     */
    createUserLinkMessage(slackUserId: string, teamId: string) {
        const config = useRuntimeConfig(),
            token = jwt.sign({
                slackUserId,
                teamId,
                ts: Date.now()
            }, config.slackLinkSecret, { expiresIn: '10m' }),
            baseUrl = config.origin,
            slackLinkUrl = new URL('/auth/slack-link', baseUrl)

        slackLinkUrl.searchParams.set('slackUserId', slackUserId)
        slackLinkUrl.searchParams.set('teamId', teamId)
        slackLinkUrl.searchParams.set('token', token)

        const authUrl = new URL('/auth', baseUrl)
        authUrl.searchParams.set('redirect', slackLinkUrl.pathname + slackLinkUrl.search)

        const link = authUrl.toString()
        return this._slackService.createUserLinkMessage(slackUserId, link)
    }

    /**
     * Create a user unlink success response
     *
     * @returns Slack message indicating successful unlink
     */
    createUserUnlinkSuccessMessage(): SlackResponseMessage {
        return this._slackService.createUserUnlinkSuccessMessage()
    }

    /**
     * Create a user link required message
     *
     * @returns Slack message indicating user must link their account first
     */
    createUserLinkRequiredMessage(): SlackResponseMessage {
        return this._slackService.createUserLinkRequiredMessage()
    }
}
