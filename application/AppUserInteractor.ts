import type { EntraGroupService } from '~/server/data/services/EntraGroupService'
import { Interactor } from './Interactor'
import type { AppRole } from '#shared/domain'
import { AppUser, PermissionDeniedException, NotFoundException } from '#shared/domain'
import type { z } from 'zod'
import type { PermissionInteractor } from './PermissionInteractor'

/**
 * Interactor for the AppUser
 */
export class AppUserInteractor extends Interactor<z.infer<typeof AppUser>> {
    private readonly _permissionInteractor: PermissionInteractor
    private readonly _groupService: EntraGroupService

    /**
     * Create a new AppUserInteractor
     *
     * @param props.permissionInteractor - The PermissionInteractor instance
     * @param props.groupService - The EntraGroupService instance
     */
    constructor(props: {
        permissionInteractor: PermissionInteractor
        groupService: EntraGroupService
    }) {
        super({ repository: null as never })
        this._permissionInteractor = props.permissionInteractor
        this._groupService = props.groupService
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
        await this._permissionInteractor.assertOrganizationAdmin(organizationId)

        try {
            // Check if user exists in Entra by email
            const entraUser = await this._groupService.getUser(email)

            if (!entraUser) {
                throw new NotFoundException(`User with email ${email} not found in Entra External ID tenant. User must be invited through the Entra admin portal first.`)
            }

            // Add user to organization role via PermissionInteractor
            await this._permissionInteractor.addAppUserOrganizationRole({
                appUserId: entraUser.id,
                organizationId,
                role
            })

            // Add user to appropriate Entra groups based on their role
            await this._groupService.addUserToOrganizationGroup({
                userId: entraUser.id,
                organizationId,
                role
            })

            return entraUser.id
        } catch (error) {
            // If it's a Microsoft Graph API error, provide more context
            if (error instanceof Error && error.message.includes('Graph API')) {
                throw new PermissionDeniedException(`Failed to invite user via Entra External ID: ${error.message}`)
            }
            throw error
        }
    }

    /**
     * Get the app user by id from Entra External ID
     * @param id - The Entra user id
     * @returns The app user data from Entra
     * @throws {NotFoundException} If the user does not exist
     * @throws {PermissionDeniedException} If the current user is not a system admin or the user being queried is not the current user
     */
    async getUserById(id: string): Promise<z.infer<typeof AppUser>> {
        const currentUserId = this._permissionInteractor.userId
        if (id !== currentUserId && !this._permissionInteractor.isSystemAdmin())
            throw new PermissionDeniedException(`User with id ${currentUserId} does not have permission to get user with id ${id}`)

        try {
            const entraUser = await this._groupService.getUser(id)
            if (!entraUser) {
                throw new NotFoundException(`User with id ${id} does not exist in Entra External ID`)
            }

            return AppUser.parse({
                id: entraUser.id,
                name: entraUser.name,
                email: entraUser.email,
                // Role is contextual and set by the caller if needed
                role: undefined
            })
        } catch (error) {
            if (error instanceof NotFoundException) throw error
            throw new NotFoundException(`Failed to get user ${id} from Entra External ID`)
        }
    }

    /**
     * Get the app user by email
     * @param email - The email of the app user
     * @returns The app user
     * @throws {NotFoundException} If the user does not exist
     * @throws {PermissionDeniedException} If the current user is not a system admin or the user being queried is not the current user
     */
    async getUserByEmail(email: string): Promise<z.infer<typeof AppUser>> {
        const currentUserId = this._permissionInteractor.userId
        const currentUser = await this.getUserById(currentUserId)

        if (email !== currentUser.email && !this._permissionInteractor.isSystemAdmin())
            throw new PermissionDeniedException(`User with id ${currentUserId} does not have permission to get user with email ${email}`)

        try {
            const entraUser = await this._groupService.getUser(email)
            if (!entraUser) {
                throw new NotFoundException(`User with email ${email} does not exist in Entra External ID`)
            }

            return AppUser.parse({
                id: entraUser.id,
                name: entraUser.name,
                email: entraUser.email,
                role: undefined
            })
        } catch (error) {
            if (error instanceof NotFoundException) throw error
            throw new NotFoundException(`Failed to get user ${email} from Entra External ID`)
        }
    }

    /**
     * Check if the requested user exists
     * @param email - The email of the user
     * @returns Whether the user exists
     * @throws {PermissionDeniedException} If the current user is not a system admin or the user being queried is not the current user
     */
    async hasUser(email: string): Promise<boolean> {
        const currentUserId = this._permissionInteractor.userId
        const currentUser = await this.getUserById(currentUserId)

        if (email !== currentUser.email && !this._permissionInteractor.isSystemAdmin())
            throw new PermissionDeniedException(`User ${currentUser.email} does not have permission to check if user with email ${email} exists`)

        try {
            const entraUser = await this._groupService.getUser(email)
            return entraUser !== null
        } catch {
            return false
        }
    }
}
