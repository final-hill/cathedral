import type { EntraService } from '~~/server/data/services/EntraService'
import { Interactor } from './Interactor'
import type { AppRole, AppUserType } from '#shared/domain'
import { AppUser, PermissionDeniedException, NotFoundException } from '#shared/domain'
import type { PermissionInteractor } from './PermissionInteractor'

/**
 * Interactor for the AppUser
 */
export class AppUserInteractor extends Interactor<AppUserType> {
    private readonly _permissionInteractor: PermissionInteractor
    private readonly _entraService: EntraService

    /**
     * Create a new AppUserInteractor
     *
     * @param props.permissionInteractor - The PermissionInteractor instance
     * @param props.entraService - The EntraGroupService instance
     */
    constructor(props: {
        permissionInteractor: PermissionInteractor
        entraService: EntraService
    }) {
        super({ repository: null as never })
        this._permissionInteractor = props.permissionInteractor
        this._entraService = props.entraService
    }

    /**
     * Invite a user to the organization via Entra External ID
     * This method adds an existing Entra user to the appropriate groups
     *
     * @param email - The email address of the user to invite
     * @param organizationId - The ID of the organization to invite the user to
     * @param role - The role to assign to the user in the organization
     * @returns The ID of the Entra user
     * @throws {PermissionDeniedException} If the current user is not an admin of the organization
     * @throws {NotFoundException} If the user doesn't exist in Entra
     */
    async inviteUserToOrganization(
        email: string,
        organizationId: string,
        role: AppRole
    ): Promise<string> {
        this._permissionInteractor.assertOrganizationAdmin(organizationId)

        try {
            const entraUser = await this._entraService.getUserByEmail(email)

            if (!entraUser)
                throw new NotFoundException(`User with email ${email} not found in Entra External ID tenant. User must be invited through the Entra admin portal first.`)

            await this._permissionInteractor.addAppUserOrganizationRole({
                appUserId: entraUser.id,
                organizationId,
                role
            })

            return entraUser.id
        } catch (error) {
            // If it's a Microsoft Graph API error, provide more context
            if (error instanceof Error && error.message.includes('Graph API'))
                throw new PermissionDeniedException(`Failed to invite user via Entra External ID: ${error.message}`)

            throw error
        }
    }

    /**
     * Add or invite a user to the organization
     * If the user exists in Entra, they will be added to the organization.
     * If the user doesn't exist, they will be invited via Entra External ID.
     *
     * @param email - The email address of the user to add/invite
     * @param organizationId - The ID of the organization
     * @param role - The role to assign to the user in the organization
     * @param redirectUrl - The URL to redirect users to after accepting the invitation
     * @returns Object containing user ID and whether an invitation was sent
     * @throws {PermissionDeniedException} If the current user is not an admin of the organization
     */
    async addOrInviteUserToOrganization(
        email: string,
        organizationId: string,
        role: AppRole,
        redirectUrl: string
    ): Promise<{ userId: string, invited: boolean }> {
        this._permissionInteractor.assertOrganizationAdmin(organizationId)

        try {
            let entraUser = await this._entraService.getUserByEmail(email),
                invited = false

            if (!entraUser) {
                entraUser = await this._entraService.createExternalUserInvitation(email, redirectUrl)
                invited = true
            }

            await this._permissionInteractor.addAppUserOrganizationRole({
                appUserId: entraUser.id,
                organizationId,
                role
            })

            return { userId: entraUser.id, invited }
        } catch (error) {
            // If it's a Microsoft Graph API error, provide more context
            if (error instanceof Error && error.message.includes('Graph API'))
                throw new PermissionDeniedException(`Failed to add/invite user via Entra External ID: ${error.message}`)

            throw error
        }
    }

    /**
     * Get the app user by id from Entra External ID
     * @param id - The Entra user id
     * @param organizationId - Organization ID to check if user has access within that organization
     * @returns The app user data from Entra
     * @throws {NotFoundException} If the user does not exist
     * @throws {PermissionDeniedException} If the current user doesn't have permission to access this user's information
     */
    async getUserById(id: string, organizationId: string): Promise<AppUserType> {
        this._permissionInteractor.assertOrganizationReader(organizationId)

        try {
            const entraUser = await this._entraService.getUser(id)
            if (!entraUser)
                throw new NotFoundException(`User with id ${id} does not exist in Entra External ID`)

            return AppUser.parse({
                id: entraUser.id,
                name: entraUser.name,
                email: entraUser.email
            })
        } catch (error) {
            if (error instanceof NotFoundException) throw error
            throw new NotFoundException(`Failed to get user ${id} from Entra External ID`)
        }
    }

    /**
     * Get the app user by email
     * @param email - The email of the app user
     * @param organizationId - Organization ID to check if user has access within that organization
     * @returns The app user
     * @throws {NotFoundException} If the user does not exist
     * @throws {PermissionDeniedException} If the current user doesn't have permission to access this user's information
     */
    async getUserByEmail(email: string, organizationId: string): Promise<AppUserType> {
        this._permissionInteractor.assertOrganizationReader(organizationId)

        try {
            const entraUser = await this._entraService.getUserByEmail(email)
            if (!entraUser)
                throw new NotFoundException(`User with email ${email} does not exist in Entra External ID`)

            return AppUser.parse({
                id: entraUser.id,
                name: entraUser.name,
                email: entraUser.email
            })
        } catch (error) {
            if (error instanceof NotFoundException) throw error
            throw new NotFoundException(`Failed to get user ${email} from Entra External ID`)
        }
    }

    /**
     * Check if the requested user exists
     * @param email - The email of the user
     * @param organizationId - Organization ID to check if user has access within that organization
     * @returns Whether the user exists
     * @throws {PermissionDeniedException} If the current user doesn't have permission to check this user's existence
     */
    async hasUser(email: string, organizationId: string): Promise<boolean> {
        this._permissionInteractor.assertOrganizationReader(organizationId)

        try {
            const entraUser = await this._entraService.getUserByEmail(email)
            return entraUser !== null
        } catch {
            return false
        }
    }
}
