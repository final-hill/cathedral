import { AppRole, MismatchException } from '#shared/domain'
import { validate as isValidUUID } from 'uuid'
import * as msal from '@azure/msal-node'
import type { Group, User } from 'microsoft-graph'

export interface ParsedPermissions {
    isSystemAdmin: boolean
    organizationRoles: Array<{
        orgId: string
        role: AppRole
    }>
}

export class EntraGroupService {
    private readonly groupPrefix = 'Cathedral-'
    private readonly systemAdminGroup = 'Cathedral-SystemAdmin'
    private authClient: msal.ConfidentialClientApplication

    constructor(config: {
        clientId: string
        clientSecret: string
        tenantId: string
    }) {
        const clientConfig = {
            auth: {
                clientId: config.clientId,
                clientSecret: config.clientSecret,
                authority: `https://login.microsoftonline.com/${config.tenantId}`
            }
        }
        this.authClient = new msal.ConfidentialClientApplication(clientConfig)
    }

    /**
     * Escape a string for safe use in OData filter expressions
     * This prevents OData injection attacks by properly escaping special characters
     */
    private escapeODataString(value: string): string {
        if (!value) return ''

        // Replace single quotes with double single quotes (OData standard escaping)
        // and escape other potentially dangerous characters
        return value
            .replace(/'/g, '\'\'') // Escape single quotes
            .replace(/\\/g, '\\\\') // Escape backslashes
    }

    /**
     * Get access token for Microsoft Graph API
     */
    private async getAccessToken(): Promise<string> {
        try {
            const tokens = await this.authClient.acquireTokenByClientCredential({
                scopes: ['https://graph.microsoft.com/.default']
            })

            if (!tokens?.accessToken) {
                throw new Error('No access token received')
            }

            return tokens.accessToken
        } catch (error) {
            console.error('Failed to acquire access token:', error)
            throw new MismatchException(`Failed to authenticate: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
    }

    /**
     * Make a request to Microsoft Graph API
     */
    private async graphRequest<T = unknown>(path: string, options: RequestInit = {}): Promise<T> {
        const accessToken = await this.getAccessToken()

        const response = await fetch(`https://graph.microsoft.com/v1.0${path}`, {
            ...options,
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
                ...options.headers
            }
        })

        if (!response.ok) {
            const errorBody = await response.text()
            console.error(`Graph API error (${response.status}):`, errorBody)
            throw new MismatchException(`Graph API request failed: ${response.status} ${response.statusText}`)
        }

        // Handle responses with no content (like 204 No Content)
        const contentLength = response.headers.get('content-length')
        if (response.status === 204 || contentLength === '0') {
            return undefined as T
        }

        // Only try to parse JSON if there's content
        const responseText = await response.text()
        if (!responseText.trim()) {
            return undefined as T
        }

        return JSON.parse(responseText) as T
    }

    /**
     * Get user's group memberships from token claims
     * Groups are configured to be emitted as role claims in the ID token
     */
    async getUserGroups(accessToken: string, userId: string, idToken?: string): Promise<string[]> {
        if (!idToken) {
            console.warn('No ID token provided - this may indicate a configuration issue')
            throw new MismatchException('ID token required for group extraction with role claims configured')
        }

        const groupIdsFromToken = this.extractGroupIdsFromRoleClaims(idToken)
        console.log('Group IDs extracted from role claims:', groupIdsFromToken)

        const groupNames = await this.resolveGroupIdsToNames(groupIdsFromToken)
        console.log('Groups resolved to names:', groupNames)

        return groupNames
    }

    /**
     * Parse group memberships to determine permissions
     */
    parseGroups(groups: string[]): ParsedPermissions {
        const isSystemAdmin = groups.includes(this.systemAdminGroup)
        const organizationRoles: Array<{ orgId: string, role: AppRole }> = []

        for (const group of groups) {
            if (group === this.systemAdminGroup) {
                continue // Already handled
            }

            const orgRole = this.parseOrganizationGroup(group)
            if (orgRole) {
                organizationRoles.push(orgRole)
            }
        }

        return {
            isSystemAdmin,
            organizationRoles
        }
    }

    /**
     * Parse organization-specific group name
     * Format: Cathedral-{orgId}-{role}
     */
    private parseOrganizationGroup(groupName: string): { orgId: string, role: AppRole } | null {
        // Match Cathedral-{UUID}-{role} pattern
        // UUID pattern: 8-4-4-4-12 hex characters separated by hyphens
        const pattern = /^Cathedral-([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})-(.+)$/i
        const match = groupName.match(pattern)

        if (!match) {
            return null
        }

        const [, orgId, roleStr] = match

        // Validate orgId is a proper UUID (redundant but good for clarity)
        if (!isValidUUID(orgId)) {
            return null
        }

        // Map role string to AppRole enum
        const role = this.mapRoleString(roleStr)
        if (!role) {
            return null
        }

        return { orgId, role }
    }

    /**
     * Map role string to AppRole enum
     */
    private mapRoleString(roleStr: string): AppRole | null {
        switch (roleStr.toLowerCase()) {
            case 'admin':
                return AppRole.ORGANIZATION_ADMIN
            case 'contributor':
                return AppRole.ORGANIZATION_CONTRIBUTOR
            case 'reader':
                return AppRole.ORGANIZATION_READER
            default:
                return null
        }
    }

    /**
     * Extract group IDs from ID token role claims
     * When "Emit groups as role claims" is configured, group IDs appear in the 'roles' claim
     */
    private extractGroupIdsFromRoleClaims(idToken: string): string[] {
        try {
            // Decode JWT payload (note: this doesn't verify signature, but it's fine for reading claims)
            const base64Payload = idToken.split('.')[1]
            const payload = JSON.parse(atob(base64Payload))

            if (process.env.NODE_ENV !== 'production') {
                console.log('ID Token payload roles:', payload.roles)
            }

            // Groups are in the 'roles' claim as an array of group IDs (GUIDs)
            const roles = payload.roles || []
            console.log('Raw roles from token:', roles)

            return roles
        } catch (error) {
            console.error('Failed to extract group IDs from ID token role claims:', error)
            throw new MismatchException(`Failed to parse ID token for role claims: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
    }

    /**
     * Resolve group IDs to group names using Microsoft Graph API
     */
    private async resolveGroupIdsToNames(groupIds: string[]): Promise<string[]> {
        if (groupIds.length === 0) {
            return []
        }

        try {
            const groupNames: string[] = []

            // Process groups in batches to avoid URL length limits
            const batchSize = 10
            for (let i = 0; i < groupIds.length; i += batchSize) {
                const batch = groupIds.slice(i, i + batchSize)

                // Build filter query for this batch
                const filterConditions = batch.map(id => `id eq '${this.escapeODataString(id)}'`).join(' or ')
                const groups = await this.graphRequest<{ value: Group[] }>(`/groups?$filter=${filterConditions}&$select=id,displayName`)

                if (groups.value) {
                    for (const group of groups.value) {
                        if (group.displayName) {
                            groupNames.push(group.displayName)
                        }
                    }
                }
            }

            console.log('Group prefix:', this.groupPrefix)
            console.log('All resolved group names:', groupNames)

            // Filter to only Cathedral groups
            const filteredGroups = groupNames.filter(name =>
                name.startsWith(this.groupPrefix)
            )
            console.log('Filtered Cathedral groups:', filteredGroups)

            return filteredGroups
        } catch (error) {
            console.error('Failed to resolve group IDs to names:', error)
            throw new MismatchException(`Failed to resolve group names: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
    }

    /**
     * Generate group names for an organization
     */
    generateOrganizationGroupNames(orgId: string): {
        admin: string
        contributor: string
        reader: string
    } {
        return {
            admin: `${this.groupPrefix}${orgId}-Admin`,
            contributor: `${this.groupPrefix}${orgId}-Contributor`,
            reader: `${this.groupPrefix}${orgId}-Reader`
        }
    }

    /**
     * Check if user has system admin permissions
     */
    isSystemAdmin(groups: string[]): boolean {
        return groups.includes(this.systemAdminGroup)
    }

    /**
     * Get user's role for a specific organization
     */
    getOrganizationRole(groups: string[], orgId: string): AppRole | null {
        const parsedPermissions = this.parseGroups(groups)

        // System admins have admin access to all organizations
        if (parsedPermissions.isSystemAdmin) {
            return AppRole.ORGANIZATION_ADMIN
        }

        const orgRole = parsedPermissions.organizationRoles.find(role => role.orgId === orgId)
        return orgRole?.role || null
    }

    /**
     * Get all organizations the user has access to
     */
    getUserOrganizations(groups: string[]): Array<{ orgId: string, role: AppRole }> {
        const parsedPermissions = this.parseGroups(groups)
        return parsedPermissions.organizationRoles
    }

    /**
     * Delete all groups associated with an organization
     * @param props.organizationId - The organization ID
     */
    async deleteOrganizationGroups(props: {
        organizationId: string
    }): Promise<void> {
        const groupNames = this.generateOrganizationGroupNames(props.organizationId)

        try {
            // Delete all organization-specific groups
            for (const groupName of Object.values(groupNames)) {
                try {
                    // Find the group
                    const escapedGroupName = this.escapeODataString(groupName)
                    const groups = await this.graphRequest<{ value: Group[] }>(`/groups?$filter=displayName eq '${escapedGroupName}'`)

                    if (groups.value && groups.value.length > 0) {
                        const group = groups.value[0]

                        // Delete the group
                        await this.graphRequest(`/groups/${group.id}`, {
                            method: 'DELETE'
                        })
                        console.log(`Deleted group: ${groupName}`)
                    } else {
                        console.log(`Group not found (may already be deleted): ${groupName}`)
                    }
                } catch (error) {
                    console.warn(`Failed to delete group ${groupName}:`, error)
                    // Continue with other groups even if one fails
                }
            }
        } catch (error) {
            console.error(`Failed to delete organization ${props.organizationId} groups:`, error)
            throw new MismatchException(`Failed to delete organization groups: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
    }

    // Microsoft Graph API operations for managing group memberships

    /**
     * Find a group by display name, or create it if it doesn't exist
     */
    private async findOrCreateGroup(groupName: string): Promise<Group> {
        try {
            // Try to find existing group by display name
            const escapedGroupName = this.escapeODataString(groupName)
            const existingGroups = await this.graphRequest<{ value: Group[] }>(`/groups?$filter=displayName eq '${escapedGroupName}'`)

            if (existingGroups.value && existingGroups.value.length > 0) {
                console.log(`Found existing group: ${groupName}`)
                return existingGroups.value[0]
            }

            // Group doesn't exist, create it
            console.log(`Creating new group: ${groupName}`)
            const newGroup = await this.graphRequest<Group>('/groups', {
                method: 'POST',
                body: JSON.stringify({
                    displayName: groupName,
                    mailEnabled: false,
                    mailNickname: groupName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase(),
                    securityEnabled: true,
                    description: `Cathedral application group for ${groupName}`
                })
            })

            return newGroup
        } catch (error) {
            console.error(`Failed to find or create group ${groupName}:`, error)
            throw new MismatchException(`Failed to find or create group: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
    }

    /**
     * Add a user to an organization group with a specific role
     * @param props.userId - The Entra user ID
     * @param props.organizationId - The organization ID
     * @param props.role - The role to assign
     */
    async addUserToOrganizationGroup(props: {
        userId: string
        organizationId: string
        role: AppRole
    }): Promise<void> {
        // 1. Generate group name using existing method
        const groupNames = this.generateOrganizationGroupNames(props.organizationId)
        let targetGroupName: string

        switch (props.role) {
            case AppRole.ORGANIZATION_ADMIN:
                targetGroupName = groupNames.admin
                break
            case AppRole.ORGANIZATION_CONTRIBUTOR:
                targetGroupName = groupNames.contributor
                break
            case AppRole.ORGANIZATION_READER:
                targetGroupName = groupNames.reader
                break
            default:
                throw new MismatchException(`Invalid role: ${props.role}`)
        }

        try {
            // 2. Find or create the group
            const group = await this.findOrCreateGroup(targetGroupName)

            // 3. Add user to the group
            await this.graphRequest(`/groups/${group.id}/members/$ref`, {
                method: 'POST',
                body: JSON.stringify({
                    '@odata.id': `https://graph.microsoft.com/v1.0/directoryObjects/${props.userId}`
                })
            })

            console.log(`Successfully added user ${props.userId} to group ${targetGroupName}`)
        } catch (error) {
            console.error(`Failed to add user ${props.userId} to group ${targetGroupName}:`, error)
            throw new MismatchException(`Failed to add user to group: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
    }

    /**
     * Remove a user from an organization group
     * @param props.userId - The Entra user ID
     * @param props.organizationId - The organization ID
     */
    async removeUserFromOrganizationGroup(props: {
        userId: string
        organizationId: string
    }): Promise<void> {
        const groupNames = this.generateOrganizationGroupNames(props.organizationId)

        try {
            // Find all Cathedral-${organizationId}-* groups user is member of
            for (const groupName of Object.values(groupNames)) {
                try {
                    // Find the group
                    const escapedGroupName = this.escapeODataString(groupName)
                    const groups = await this.graphRequest<{ value: Group[] }>(`/groups?$filter=displayName eq '${escapedGroupName}'`)

                    if (groups.value && groups.value.length > 0) {
                        const group = groups.value[0]

                        // Check if user is a member of this group
                        const members = await this.graphRequest<{ value: User[] }>(`/groups/${group.id}/members?$filter=id eq '${props.userId}'`)

                        if (members.value && members.value.length > 0) {
                            // Remove user from this group
                            await this.graphRequest(`/groups/${group.id}/members/${props.userId}/$ref`, {
                                method: 'DELETE'
                            })
                            console.log(`Removed user ${props.userId} from group ${groupName}`)
                        }
                    }
                } catch (error) {
                    console.warn(`Failed to remove user from group ${groupName}:`, error)
                    // Continue with other groups even if one fails
                }
            }
        } catch (error) {
            console.error(`Failed to remove user ${props.userId} from organization ${props.organizationId} groups:`, error)
            throw new MismatchException(`Failed to remove user from organization groups: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
    }

    /**
     * Update a user's role in an organization group
     * @param props.userId - The Entra user ID
     * @param props.organizationId - The organization ID
     * @param props.newRole - The new role to assign
     */
    async updateUserOrganizationRole(props: {
        userId: string
        organizationId: string
        newRole: AppRole
    }): Promise<void> {
        // TODO: Implement with Microsoft Graph API
        // 1. Remove user from current organization groups
        await this.removeUserFromOrganizationGroup({
            userId: props.userId,
            organizationId: props.organizationId
        })
        // 2. Add user to new role group
        await this.addUserToOrganizationGroup({
            userId: props.userId,
            organizationId: props.organizationId,
            role: props.newRole
        })
    }

    /**
     * Get user information including name
     * @param userId - The Entra user ID
     * @returns User information
     */
    async getUser(userId: string): Promise<{
        id: string
        name: string
        email: string
    }> {
        try {
            const user = await this.graphRequest<User>(`/users/${userId}?$select=id,displayName,userPrincipalName,mail`)

            return {
                id: user.id!,
                name: user.displayName || user.userPrincipalName || 'Unknown User',
                email: user.mail || user.userPrincipalName || ''
            }
        } catch (error) {
            console.error(`Failed to get user ${userId}:`, error)
            throw new MismatchException(`Failed to get user: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
    }

    /**
     * Search for a user by email address
     * @param email - The email address to search for
     * @returns User information if found, null if not found
     */
    async getUserByEmail(email: string): Promise<{
        id: string
        name: string
        email: string
    } | null> {
        try {
            // Properly escape the email parameter for OData filter to prevent injection attacks
            const escapedEmail = this.escapeODataString(email)
            // Use the Microsoft Graph filter to search for users by mail or userPrincipalName
            const users = await this.graphRequest<{ value: User[] }>(`/users?$filter=mail eq '${escapedEmail}' or userPrincipalName eq '${escapedEmail}'&$select=id,displayName,userPrincipalName,mail`)

            if (!users.value || users.value.length === 0) {
                return null
            }

            const user = users.value[0]
            return {
                id: user.id!,
                name: user.displayName || user.userPrincipalName || 'Unknown User',
                email: user.mail || user.userPrincipalName || ''
            }
        } catch (error) {
            console.error(`Failed to search for user ${email}:`, error)
            return null
        }
    }

    /**
     * Create an external user invitation via Microsoft Graph
     * @param email - The email address to invite
     * @param redirectUrl - The URL to redirect users to after accepting the invitation
     * @param displayName - Optional display name for the invited user
     * @returns The invited user information
     */
    async createExternalUserInvitation(email: string, redirectUrl: string, displayName?: string): Promise<{
        id: string
        name: string
        email: string
    }> {
        try {
            const invitation = await this.graphRequest<{
                id: string
                inviteRedeemUrl: string
                invitedUser: User
                status: string
            }>('/invitations', {
                method: 'POST',
                body: JSON.stringify({
                    invitedUserEmailAddress: email,
                    inviteRedirectUrl: redirectUrl,
                    invitedUserDisplayName: displayName || email.split('@')[0],
                    sendInvitationMessage: true
                })
            })

            const user = invitation.invitedUser
            return {
                id: user.id!,
                name: user.displayName || displayName || email.split('@')[0],
                email: user.mail || user.userPrincipalName || email
            }
        } catch (error) {
            console.error(`Failed to create invitation for ${email}:`, error)
            throw new MismatchException(`Failed to create invitation: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
    }

    /**
     * Get all users in an organization with their roles
     * @param organizationId - The organization ID
     * @returns List of users with their roles
     */
    async getOrganizationUsers(organizationId: string): Promise<Array<{
        user: { id: string, name: string, email: string }
        role: AppRole
    }>> {
        const groupNames = this.generateOrganizationGroupNames(organizationId)
        const userRoleMap = new Map<string, { user: { id: string, name: string, email: string }, role: AppRole }>()

        try {
            // Get members from each role group
            for (const [roleKey, groupName] of Object.entries(groupNames)) {
                const role = this.mapRoleKeyToAppRole(roleKey)
                if (!role) continue

                try {
                    // Find the group
                    const escapedGroupName = this.escapeODataString(groupName)
                    const groups = await this.graphRequest<{ value: Group[] }>(`/groups?$filter=displayName eq '${escapedGroupName}'`)

                    if (groups.value && groups.value.length > 0) {
                        const group = groups.value[0]

                        // Get group members
                        const members = await this.graphRequest<{ value: User[] }>(`/groups/${group.id}/members?$select=id,displayName,userPrincipalName,mail`)

                        if (members.value) {
                            for (const member of members.value) {
                                const user = member as User
                                if (user.id) {
                                    userRoleMap.set(user.id, {
                                        user: {
                                            id: user.id,
                                            name: user.displayName || user.userPrincipalName || 'Unknown User',
                                            email: user.mail || user.userPrincipalName || ''
                                        },
                                        role
                                    })
                                }
                            }
                        }
                    }
                } catch (error) {
                    console.warn(`Failed to get members from group ${groupName}:`, error)
                    // Continue with other groups even if one fails
                }
            }

            return Array.from(userRoleMap.values())
        } catch (error) {
            console.error(`Failed to get users for organization ${organizationId}:`, error)
            throw new MismatchException(`Failed to get organization users: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
    }

    /**
     * Map role key to AppRole enum
     */
    private mapRoleKeyToAppRole(roleKey: string): AppRole | null {
        switch (roleKey) {
            case 'admin':
                return AppRole.ORGANIZATION_ADMIN
            case 'contributor':
                return AppRole.ORGANIZATION_CONTRIBUTOR
            case 'reader':
                return AppRole.ORGANIZATION_READER
            default:
                return null
        }
    }
}
