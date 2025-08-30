import { Interactor } from '../Interactor'
import type { PermissionInteractor } from '../PermissionInteractor'
import { NotFoundException } from '#shared/domain/exceptions'
import type { SlackWorkspaceMetaType, SlackWorkspaceMetaPublicType } from '#shared/domain/application'
import type { SlackWorkspaceRepository } from '~~/server/data/repositories'
import { SlackService } from '~~/server/data/services'

/**
 * Slack Workspace Interactor
 *
 * Handles workspace-level operations for Slack integrations.
 * This interactor manages:
 * - OAuth flow and workspace installation
 * - Workspace configuration and metadata
 * - Organization-workspace relationships
 */
export class SlackWorkspaceInteractor extends Interactor<SlackWorkspaceMetaType> {
    protected readonly _permissionInteractor: PermissionInteractor

    constructor(props: {
        repository: SlackWorkspaceRepository
        permissionInteractor: PermissionInteractor
    }) {
        super({ repository: props.repository })
        this._permissionInteractor = props.permissionInteractor
    }

    // Type-safe repository access
    get repository(): SlackWorkspaceRepository {
        return this._repository as SlackWorkspaceRepository
    }

    /**
     * Get all Slack workspace integrations for an organization
     *
     * @param organizationId - The organization ID
     * @param organizationName - The organization name (for validation)
     * @throws NotFoundException if organization not found
     * @throws PermissionException if user is not an organization reader
     * @returns Array of workspace integrations
     */
    async getOrganizationWorkspaces(organizationId: string, organizationName: string): Promise<SlackWorkspaceMetaPublicType[]> {
        this._permissionInteractor.assertOrganizationReader(organizationId)

        const workspaces = await this.repository.getWorkspacesByOrganization(organizationId, organizationName),
            enrichedWorkspaces = await Promise.all(
                workspaces.map(async (workspace) => {
                    try {
                        const user = await this._permissionInteractor.entraService.getUser(workspace.installedById)
                        return {
                            ...workspace,
                            installedByName: user.name
                        }
                    } catch (error) {
                        console.warn(`Failed to get user name for ${workspace.installedById}:`, error)
                        return {
                            ...workspace,
                            installedByName: '{Unknown User}'
                        }
                    }
                })
            )

        return enrichedWorkspaces
    }

    /**
     * Install a Slack workspace for an organization
     *
     * @param props - Installation parameters
     * @throws { PermissionException } if user lacks contributor access
     */
    async installWorkspaceForOrganization(props: {
        organizationId: string
        teamId: string
        teamName: string
        accessToken: string
        botUserId: string
        installedById: string
        scope: string
        appId: string
    }) {
        this._permissionInteractor.assertOrganizationContributor(props.organizationId)

        return await this.repository.installWorkspace({
            ...props,
            installationDate: new Date()
        })
    }

    /**
     * Remove a Slack workspace integration from an organization
     *
     * @param organizationId - The organization ID
     * @param teamId - The Slack team/workspace ID
     * @throws { PermissionException } if user lacks contributor access
     */
    async removeWorkspaceFromOrganization(organizationId: string, teamId: string) {
        this._permissionInteractor.assertOrganizationContributor(organizationId)

        return await this.repository.removeWorkspace(organizationId, teamId)
            .catch(handleDomainException)
    }

    /**
     * Get workspace configuration for a specific team
     *
     * @param teamId - The Slack team/workspace ID
     * @throws { NotFoundException } if workspace not found
     * @throws { PermissionException } if user lacks organization read access
     */
    async getWorkspaceConfiguration(teamId: string) {
        const workspaceInfo = await this.repository.getWorkspaceByTeamId(teamId)

        if (!workspaceInfo) throw new NotFoundException('Slack workspace integration not found')

        this._permissionInteractor.assertOrganizationReader(workspaceInfo.organization.id)

        return await this.repository.getWorkspaceConfiguration(teamId)
    }

    /**
     * Update workspace metadata (e.g., team name, bot user info)
     *
     * @param teamId - The Slack team/workspace ID
     * @param updates - Metadata updates
     * @throws { NotFoundException } if workspace not found
     * @throws { PermissionException } if user lacks organization contributor access
     */
    async updateWorkspaceMetadata(teamId: string, updates: {
        teamName?: string
        botUserId?: string
        lastMetadataRefresh?: Date
    }) {
        const workspaceInfo = await this.repository.getWorkspaceByTeamId(teamId)

        if (!workspaceInfo) throw new NotFoundException('Slack workspace integration not found')

        this._permissionInteractor.assertOrganizationContributor(workspaceInfo.organization.id)

        return await this.repository.updateWorkspaceMetadata(teamId, {
            ...updates,
            lastMetadataRefresh: updates.lastMetadataRefresh || new Date()
        })
    }

    /**
     * Refresh workspace metadata from Slack API
     *
     * Business Rules:
     * - User must have contributor access to the organization using this workspace
     * - Fetches current team information from Slack API and updates local data
     *
     * @param teamId - The Slack team/workspace ID
     * @throws { NotFoundException } if workspace not found
     * @throws { PermissionException } if user lacks organization contributor access
     * @returns Updated workspace configuration
     */
    async refreshWorkspaceFromSlackAPI(teamId: string) {
        const workspaceConfig = await this.repository.getWorkspaceByTeamId(teamId)

        if (!workspaceConfig) throw new NotFoundException('Slack workspace integration not found')

        this._permissionInteractor.assertOrganizationContributor(workspaceConfig.organization.id)

        const config = useRuntimeConfig(),
            slackService = new SlackService(workspaceConfig.accessToken, config.slackSigningSecret),

            teamInfo = await slackService.getTeamInfo(teamId)

        if (teamInfo && teamInfo.name) {
            await this.repository.updateWorkspaceMetadata(teamId, {
                teamName: teamInfo.name,
                lastMetadataRefresh: new Date()
            })
        }

        const updatedConfig = await this.repository.getWorkspaceConfiguration(teamId)

        if (!updatedConfig) throw new NotFoundException('Slack workspace integration not found after update')

        return updatedConfig
    }
}
