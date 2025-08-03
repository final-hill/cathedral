import type { AppUserOrganizationRole, Organization, AppUser } from '#shared/domain'
import { AppRole, NotFoundException, PermissionDeniedException } from '#shared/domain'
import type { EntraGroupService } from '~/server/data/services/EntraGroupService'
import type { UserSession } from '#auth-utils'
import type { z } from 'zod'
import type { H3Event } from 'h3'

/**
 * Interactor for checking permissions
 * for the current user in the context of an organization.
 */
export class PermissionInteractor {
    private readonly _session: UserSession
    private readonly _event?: H3Event
    private readonly _groupService: EntraGroupService

    constructor(props: {
        session: UserSession
        event?: H3Event
        groupService: EntraGroupService
    }) {
        this._session = props.session
        this._event = props.event
        this._groupService = props.groupService

        // Ensure we have a valid user session
        if (!this._session.user) {
            throw new PermissionDeniedException('Invalid user session: user not found')
        }
    }

    get userId(): z.infer<typeof AppUser>['id'] {
        return this._session.user!.id
    }

    get groupService(): EntraGroupService {
        return this._groupService
    }

    /**
     * Check if the user is an organization admin
     * @param organizationId Optional organization ID for organization-specific checks
     * @throws {PermissionDeniedException} If the user is not an organization admin
     */
    assertOrganizationAdmin(organizationId: z.infer<typeof Organization>['id']): void {
        if (!this.isOrganizationAdmin(organizationId))
            throw new PermissionDeniedException('Forbidden: You do not have admin permissions.')
    }

    /**
     * Check if the user is an organization contributor
     * @param organizationId Optional organization ID for organization-specific checks
     * @throws {PermissionDeniedException} If the user is not an organization contributor
     */
    assertOrganizationContributor(organizationId: z.infer<typeof Organization>['id']): void {
        if (!this.isOrganizationContributor(organizationId))
            throw new PermissionDeniedException('Forbidden: You do not have contributor permissions.')
    }

    /**
     * Check if the user is an organization reader
     * @param organizationId Optional organization ID for organization-specific checks
     * @throws {PermissionDeniedException} If the user is not an organization reader
     */
    assertOrganizationReader(organizationId: z.infer<typeof Organization>['id']): void {
        if (!this.isOrganizationReader(organizationId))
            throw new PermissionDeniedException('Forbidden: You do not have reader permissions.')
    }

    /**
     * Add an appuser to the organization with a role
     * @param props.appUserId The id of the app user to invite
     * @param props.organizationId The id of the organization to add the app user to
     * @param props.role The role to assign to the app user
     */
    async addAppUserOrganizationRole(props: { appUserId: string, organizationId: string, role: AppRole }): Promise<void> {
        // Ensure the current user has permission to manage roles in this organization
        this.assertOrganizationAdmin(props.organizationId)

        // Add the user to the appropriate Entra group
        await this._groupService.addUserToOrganizationGroup({
            userId: props.appUserId,
            organizationId: props.organizationId,
            role: props.role
        })
    }

    /**
     * Add a user as organization admin during organization creation
     * This bypasses the normal permission checks since the organization is being created
     * @param props.appUserId The id of the app user to add as admin
     * @param props.organizationId The id of the newly created organization
     * @param props.role The role to assign to the app user
     */
    async addOrganizationCreatorRole(props: { appUserId: string, organizationId: string, role: AppRole }): Promise<void> {
        // No permission check needed - this is for the creator during organization creation
        // Add the user to the appropriate Entra group
        await this._groupService.addUserToOrganizationGroup({
            userId: props.appUserId,
            organizationId: props.organizationId,
            role: props.role
        })

        // Dynamically update session groups if this is for the current user
        if (props.appUserId === this.userId) {
            await this.refreshSessionGroups(props.organizationId, props.role)
        }
    }

    /**
     * Delete an app user from the organization
     * @param props.appUserId The id of the app user to remove
     * @param props.organizationId The id of the organization to remove the app user from
     */
    async deleteAppUserOrganizationRole(props: { appUserId: string, organizationId: string }): Promise<void> {
        // Ensure the current user has permission to manage roles in this organization
        this.assertOrganizationAdmin(props.organizationId)

        // Remove the user from all organization groups
        await this._groupService.removeUserFromOrganizationGroup({
            userId: props.appUserId,
            organizationId: props.organizationId
        })
    }

    /**
     * Find all AppUserOrganizationRoles for the given organization
     * @param props.organizationId - The id of the organization
     * @param props.appUserId - The id of the app user
     * @param props.role - The role of the app user in the organization
     * @returns Array of user-role mappings from Entra groups
     */
    async findAppUserOrganizationRoles(props: { appUserId?: z.infer<typeof AppUser>['id'], organizationId: z.infer<typeof Organization>['id'], role?: AppRole }): Promise<z.infer<typeof AppUserOrganizationRole>[]> {
        // Ensure the current user has permission to read roles in this organization
        this.assertOrganizationReader(props.organizationId)

        // Get users and their roles from Entra groups
        const organizationUsers = await this._groupService.getOrganizationUsers(props.organizationId)

        // Filter by specific user if requested
        const filteredUsers = props.appUserId
            ? organizationUsers.filter(orgUser => orgUser.user.id === props.appUserId)
            : organizationUsers

        // Filter by role if requested
        const roleFilteredUsers = props.role
            ? filteredUsers.filter(orgUser => orgUser.role === props.role)
            : filteredUsers

        // Convert to AppUserOrganizationRole format
        return roleFilteredUsers.map(orgUser => ({
            appUser: { id: orgUser.user.id, name: orgUser.user.name },
            organization: { id: props.organizationId, name: '' }, // TODO: Get org name from somewhere
            role: orgUser.role
        } as z.infer<typeof AppUserOrganizationRole>))
    }

    /**
     * Returns the AppUserOrganizationRole for the given app user and organization
     * @param props.appUserId - The id of the app user
     * @param props.organizationId - The id of the organization
     * @returns The AppUserOrganizationRole from Entra groups
     * @throws {NotFoundException} If the user is not found in the organization
     */
    async getAppUserOrganizationRole(props: { appUserId: z.infer<typeof AppUser>['id'], organizationId: z.infer<typeof Organization>['id'] }): Promise<z.infer<typeof AppUserOrganizationRole>> {
        // Find the user's roles in this organization
        const roles = await this.findAppUserOrganizationRoles({
            appUserId: props.appUserId,
            organizationId: props.organizationId
        })

        if (roles.length === 0) {
            throw new NotFoundException('User is not a member of this organization')
        }

        // Return the first role (users should only have one role per organization)
        return roles[0]
    }

    /**
     * Get the current user's name from session
     * @returns The current user's name
     */
    getCurrentUserName(): string {
        return this._session.user!.name
    }

    /**
     * Check if the user is a system admin
     * @returns True if the user is a system admin
     */
    isSystemAdmin(): boolean {
        return this._session.user!.isSystemAdmin
    }

    /**
     * Check if the user is an organization admin
     * @param organizationId Optional organization ID for organization-specific checks
     * @returns True if the user is an organization admin
     */
    isOrganizationAdmin(organizationId: z.infer<typeof Organization>['id']): boolean {
        if (this._session.user!.isSystemAdmin) {
            return true
        }

        const orgRole = this._session.user!.organizationRoles.find(role => role.orgId === organizationId)
        return orgRole?.role === AppRole.ORGANIZATION_ADMIN
    }

    /**
     * Check if the user is an organization contributor
     * @param organizationId Optional organization ID for organization-specific checks
     * @returns True if the user is an organization contributor
     */
    isOrganizationContributor(organizationId: z.infer<typeof Organization>['id']): boolean {
        if (this._session.user!.isSystemAdmin) {
            return true
        }

        const orgRole = this._session.user!.organizationRoles.find(role => role.orgId === organizationId)
        return orgRole?.role ? [AppRole.ORGANIZATION_ADMIN, AppRole.ORGANIZATION_CONTRIBUTOR].includes(orgRole.role) : false
    }

    /**
     * Check if the user is an organization reader
     * @param organizationId Optional organization ID for organization-specific checks
     * @returns True if the user is an organization reader
     */
    isOrganizationReader(organizationId: z.infer<typeof Organization>['id']): boolean {
        if (this._session.user!.isSystemAdmin) {
            return true
        }

        const orgRole = this._session.user!.organizationRoles.find(role => role.orgId === organizationId)
        return orgRole?.role ? [AppRole.ORGANIZATION_ADMIN, AppRole.ORGANIZATION_CONTRIBUTOR, AppRole.ORGANIZATION_READER].includes(orgRole.role) : false
    }

    /**
     * Update a target user by id in a given organization to have a new role
     * @param props.appUserId The id of the target user to update
     * @param props.organizationId The id of the organization to update the target user in
     * @param props.role The new role to assign to the target user
     */
    async updateAppUserRole(props: { appUserId: z.infer<typeof AppUser>['id'], organizationId: z.infer<typeof Organization>['id'], role: AppRole }): Promise<void> {
        // Ensure the current user has permission to manage roles in this organization
        this.assertOrganizationAdmin(props.organizationId)

        // Update the user's role in Entra groups
        await this._groupService.updateUserOrganizationRole({
            userId: props.appUserId,
            organizationId: props.organizationId,
            newRole: props.role
        })
    }

    /**
     * Refresh session permissions by adding the new organization role to the current session
     * This ensures permission checks work immediately after organization creation
     * @param organizationId The organization ID that was just created
     * @param role The role assigned to the current user
     */
    private async refreshSessionGroups(organizationId: string, role: AppRole): Promise<void> {
        const existingOrgRole = this._session.user!.organizationRoles.find(
            orgRole => orgRole.orgId === organizationId
        )

        if (!existingOrgRole) {
            // Update the session with the new organization role if we have an event context
            if (this._event) {
                await setUserSession(this._event, {
                    user: {
                        ...this._session.user!,
                        organizationRoles: [
                            ...this._session.user!.organizationRoles,
                            { orgId: organizationId, role }
                        ]
                    }
                })
                console.log(`Updated session permissions: added ${role} role for organization ${organizationId}`)
            } else {
                // For non-HTTP contexts (like Slack operations), just update the in-memory session
                this._session.user!.organizationRoles = [
                    ...this._session.user!.organizationRoles,
                    { orgId: organizationId, role }
                ]
                console.log(`Updated in-memory session permissions: added ${role} role for organization ${organizationId}`)
            }
        }
    }
}
