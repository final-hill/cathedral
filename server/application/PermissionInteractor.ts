import type { AppUserType, OrganizationType, AppUserOrganizationRoleType } from '#shared/domain'
import { AppRole, NotFoundException, PermissionDeniedException } from '#shared/domain'
import type { EntraService } from '~~/server/data/services/EntraService'
import type { UserSession } from '#auth-utils'
import type { H3Event } from 'h3'

/**
 * Interactor for checking permissions
 * for the current user in the context of an organization.
 */
export class PermissionInteractor {
    private readonly session: UserSession
    private readonly event?: H3Event
    readonly entraService: EntraService

    constructor(props: {
        session: UserSession
        event?: H3Event
        entraService: EntraService
    }) {
        this.session = props.session
        this.event = props.event
        this.entraService = props.entraService

        if (!this.session.user)
            throw new PermissionDeniedException('Invalid user session: user not found')
    }

    get userId(): AppUserType['id'] {
        return this.session.user!.id
    }

    /**
     * Check if the user is an organization admin
     * @param organizationId Optional organization ID for organization-specific checks
     * @throws {PermissionDeniedException} If the user is not an organization admin
     */
    assertOrganizationAdmin(organizationId: OrganizationType['id']): void {
        if (!this.isOrganizationAdmin(organizationId)) throw new PermissionDeniedException('Forbidden: You do not have admin permissions.')
    }

    /**
     * Check if the user is an organization contributor
     * @param organizationId Optional organization ID for organization-specific checks
     * @throws {PermissionDeniedException} If the user is not an organization contributor
     */
    assertOrganizationContributor(organizationId: OrganizationType['id']): void {
        if (!this.isOrganizationContributor(organizationId)) throw new PermissionDeniedException('Forbidden: You do not have contributor permissions.')
    }

    /**
     * Check if the user is an organization reader
     * @param organizationId Optional organization ID for organization-specific checks
     * @throws {PermissionDeniedException} If the user is not an organization reader
     */
    assertOrganizationReader(organizationId: OrganizationType['id']): void {
        if (!this.isOrganizationReader(organizationId)) throw new PermissionDeniedException('Forbidden: You do not have reader permissions.')
    }

    /**
     * Add an appuser to the organization with a role
     * @param props.appUserId The id of the app user to invite
     * @param props.organizationId The id of the organization to add the app user to
     * @param props.role The role to assign to the app user
     */
    async addAppUserOrganizationRole(props: { appUserId: string, organizationId: string, role: AppRole }): Promise<void> {
        this.assertOrganizationAdmin(props.organizationId)

        await this.entraService.addUserToOrganizationGroup({
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
        await this.entraService.addUserToOrganizationGroup({
            userId: props.appUserId,
            organizationId: props.organizationId,
            role: props.role
        })

        // Dynamically update session groups if this is for the current user
        if (props.appUserId === this.userId)
            await this.refreshSessionGroups({ organizationId: props.organizationId, role: props.role })
    }

    /**
     * Delete an app user from the organization
     * @param props.appUserId The id of the app user to remove
     * @param props.organizationId The id of the organization to remove the app user from
     */
    async deleteAppUserOrganizationRole(props: { appUserId: string, organizationId: string }): Promise<void> {
        this.assertOrganizationAdmin(props.organizationId)

        await this.entraService.removeUserFromOrganizationGroup({
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
    async findAppUserOrganizationRoles(props: { appUserId?: AppUserType['id'], organizationId: OrganizationType['id'], role?: AppRole }): Promise<AppUserOrganizationRoleType[]> {
        this.assertOrganizationReader(props.organizationId)

        const organizationUsers = await this.entraService.getOrganizationUsers(props.organizationId),
            filteredUsers = props.appUserId
                ? organizationUsers.filter(orgUser => orgUser.user.id === props.appUserId)
                : organizationUsers,
            roleFilteredUsers = props.role
                ? filteredUsers.filter(orgUser => orgUser.role === props.role)
                : filteredUsers

        return roleFilteredUsers.map(orgUser => ({
            appUser: { id: orgUser.user.id, name: orgUser.user.name },
            organization: { id: props.organizationId, name: '' }, // TODO: Get org name from somewhere
            role: orgUser.role
        } as AppUserOrganizationRoleType))
    }

    /**
     * Returns the AppUserOrganizationRole for the given app user and organization
     * @param props.appUserId - The id of the app user
     * @param props.organizationId - The id of the organization
     * @returns The AppUserOrganizationRole from Entra groups
     * @throws {NotFoundException} If the user is not found in the organization
     */
    async getAppUserOrganizationRole(props: { appUserId: AppUserType['id'], organizationId: OrganizationType['id'] }): Promise<AppUserOrganizationRoleType> {
        const roles = await this.findAppUserOrganizationRoles({
            appUserId: props.appUserId,
            organizationId: props.organizationId
        })

        if (roles.length === 0)
            throw new NotFoundException('User is not a member of this organization')

        const role = roles[0]
        if (!role)
            throw new NotFoundException('User role not found')

        return role
    }

    /**
     * Get the current user's name from session
     * @returns The current user's name
     */
    getCurrentUserName(): string {
        return this.session.user!.name
    }

    /**
     * Check if the user is a system admin
     * @returns True if the user is a system admin
     */
    isSystemAdmin(): boolean {
        return this.session.user!.isSystemAdmin
    }

    /**
     * Check if the user is an organization admin
     * @param organizationId Optional organization ID for organization-specific checks
     * @returns True if the user is an organization admin
     */
    isOrganizationAdmin(organizationId: OrganizationType['id']): boolean {
        if (this.session.user!.isSystemAdmin)
            return true

        const orgRole = this.session.user!.organizationRoles.find(role => role.orgId === organizationId)
        return orgRole?.role === AppRole.ORGANIZATION_ADMIN
    }

    /**
     * Check if the user is an organization contributor
     * @param organizationId Optional organization ID for organization-specific checks
     * @returns True if the user is an organization contributor
     */
    isOrganizationContributor(organizationId: OrganizationType['id']): boolean {
        if (this.session.user!.isSystemAdmin)
            return true

        const orgRole = this.session.user!.organizationRoles.find(role => role.orgId === organizationId)
        return orgRole?.role ? [AppRole.ORGANIZATION_ADMIN, AppRole.ORGANIZATION_CONTRIBUTOR].includes(orgRole.role) : false
    }

    /**
     * Check if the user is an organization reader
     * @param organizationId Optional organization ID for organization-specific checks
     * @returns True if the user is an organization reader
     */
    isOrganizationReader(organizationId: OrganizationType['id']): boolean {
        if (this.session.user!.isSystemAdmin)
            return true

        const orgRole = this.session.user!.organizationRoles.find(role => role.orgId === organizationId)
        return orgRole?.role ? [AppRole.ORGANIZATION_ADMIN, AppRole.ORGANIZATION_CONTRIBUTOR, AppRole.ORGANIZATION_READER].includes(orgRole.role) : false
    }

    /**
     * Update a target user by id in a given organization to have a new role
     * @param props.appUserId The id of the target user to update
     * @param props.organizationId The id of the organization to update the target user in
     * @param props.role The new role to assign to the target user
     */
    async updateAppUserRole(props: { appUserId: AppUserType['id'], organizationId: OrganizationType['id'], role: AppRole }): Promise<void> {
        this.assertOrganizationAdmin(props.organizationId)

        await this.entraService.updateUserOrganizationRole({
            userId: props.appUserId,
            organizationId: props.organizationId,
            newRole: props.role
        })
    }

    /**
     * Refresh session permissions by adding the new organization role to the current session
     * This ensures permission checks work immediately after organization creation
     * @param params - The parameters for refreshing session groups
     * @param params.organizationId - The organization ID that was just created
     * @param params.role - The role assigned to the current user
     */
    private async refreshSessionGroups({ organizationId, role }: { organizationId: string, role: AppRole }): Promise<void> {
        const existingOrgRole = this.session.user!.organizationRoles.find(
            orgRole => orgRole.orgId === organizationId
        )

        if (!existingOrgRole) {
            // Update the session with the new organization role if we have an event context
            if (this.event) {
                await setUserSession(this.event, {
                    user: {
                        ...this.session.user!,
                        organizationRoles: [
                            ...this.session.user!.organizationRoles,
                            { orgId: organizationId, role }
                        ]
                    }
                })
            } else {
                // For non-HTTP contexts (like Slack operations), just update the in-memory session
                this.session.user!.organizationRoles = [
                    ...this.session.user!.organizationRoles,
                    { orgId: organizationId, role }
                ]
            }
        }
    }
}
