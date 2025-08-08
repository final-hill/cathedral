import { Interactor } from './Interactor'
import type { OrganizationInteractor } from './OrganizationInteractor'
import type { SlackUserInteractor } from './slack/SlackUserInteractor'
import type { AppUserType } from '#shared/domain/application'

/**
 * Composite interactor that handles AppUser operations with Slack associations
 *
 * This interactor composes OrganizationInteractor and SlackUserInteractor to provide
 * a clean interface for operations that require both organization user data and
 * their associated Slack information.
 */
export class AppUserSlackInteractor extends Interactor<AppUserType> {
    private readonly _organizationInteractor: OrganizationInteractor
    private readonly _slackUserInteractor: SlackUserInteractor

    constructor(props: {
        organizationInteractor: OrganizationInteractor
        slackUserInteractor: SlackUserInteractor
    }) {
        super({ repository: null as never })
        this._organizationInteractor = props.organizationInteractor
        this._slackUserInteractor = props.slackUserInteractor
    }

    /**
     * Get an app user by ID with their Slack associations
     *
     * @param userId - The ID of the user to retrieve
     * @returns The user with their Slack associations
     * @throws {NotFoundException} If the user does not exist
     * @throws {PermissionDeniedException} If not authorized to view the user
     */
    async getAppUserByIdWithSlack(userId: string): Promise<AppUserType> {
        const user = await this._organizationInteractor.getAppUserById(userId)

        try {
            const slackAssociations = await this._slackUserInteractor.getSlackUsersForCathedralUser(userId)
            return {
                ...user,
                slackAssociations
            }
        } catch {
            // If Slack lookup fails, return user without associations
            return {
                ...user,
                slackAssociations: []
            }
        }
    }

    /**
     * Get all app users for the organization with their Slack associations
     *
     * @returns All users with their Slack associations
     * @throws {PermissionDeniedException} If not authorized to view users
     */
    async getAppUsersWithSlack(): Promise<AppUserType[]> {
        const users = await this._organizationInteractor.getAppUsers()

        if (users.length === 0) {
            return users
        }

        // Bulk load Slack associations for all users
        const usersWithSlack = await Promise.all(
            users.map(async (user) => {
                try {
                    const slackAssociations = await this._slackUserInteractor.getSlackUsersForCathedralUser(user.id)
                    return { ...user, slackAssociations }
                } catch (error) {
                    console.warn(`Failed to load Slack associations for user ${user.id}:`, error)
                    return { ...user, slackAssociations: [] }
                }
            })
        )

        return usersWithSlack
    }
}
