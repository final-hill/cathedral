import { Repository } from "./Repository";
import { SlackWorkspaceMetaModel } from "../models/application/SlackWorkspaceMetaModel";
import type { SlackWorkspaceMetaPublicType } from "#shared/domain/application";
import { NotFoundException } from "~/shared/domain";

/**
 * Repository for managing Slack workspace data operations
 */
export class SlackWorkspaceRepository extends Repository<SlackWorkspaceMetaModel> {

    /**
     * Get all Slack workspace integrations for an organization
     * @param organizationId - The organization ID
     * @param organizationName - The organization name
     * @returns Array of Slack workspace metadata (excluding sensitive data)
     */
    async getWorkspacesByOrganization(organizationId: string, organizationName: string): Promise<SlackWorkspaceMetaPublicType[]> {
        const em = this._em;

        const workspaceIntegrations = await em.find(SlackWorkspaceMetaModel, {
            organization: organizationId
        }, {
            populate: ['installedBy']
        });

        // Map to domain objects (excluding sensitive data like access tokens)
        return workspaceIntegrations.map(integration => ({
            teamId: integration.teamId,
            teamName: integration.teamName,
            organizationId: organizationId,
            organizationName: organizationName,
            botUserId: integration.botUserId,
            scope: integration.scope,
            appId: integration.appId,
            installedById: integration.installedBy.id,
            installedByName: integration.installedBy.name,
            installationDate: integration.installationDate,
            lastRefreshDate: integration.lastRefreshDate
        }));
    }

    /**
     * Get a specific Slack workspace integration by team ID
     * @param teamId - The Slack team ID
     * @returns Slack workspace metadata or null if not found (including access token for internal use)
     */
    async getWorkspaceByTeamId(teamId: string): Promise<SlackWorkspaceMetaModel | null> {
        const em = this._em;

        return await em.findOne(SlackWorkspaceMetaModel, {
            teamId
        }, {
            populate: ['installedBy', 'organization']
        });
    }

    /**
     * Install or update a Slack workspace integration
     * @param props - Installation parameters
     * @returns The created or updated workspace integration
     */
    async installWorkspace(props: {
        organizationId: string;
        teamId: string;
        teamName: string;
        accessToken: string;
        botUserId: string;
        installedById: string;
        installationDate: Date;
        scope: string;
        appId: string;
    }): Promise<SlackWorkspaceMetaModel> {
        const em = this._em;

        let workspace = await em.findOne(SlackWorkspaceMetaModel, {
            teamId: props.teamId,
            organization: props.organizationId
        });

        if (workspace) {
            em.assign(workspace, {
                teamName: props.teamName,
                accessToken: props.accessToken,
                botUserId: props.botUserId,
                lastRefreshDate: props.installationDate
            })
        } else {
            workspace = em.create(SlackWorkspaceMetaModel, {
                teamId: props.teamId,
                teamName: props.teamName,
                organization: props.organizationId,
                accessToken: props.accessToken,
                botUserId: props.botUserId,
                installedBy: props.installedById,
                installationDate: props.installationDate,
                lastRefreshDate: props.installationDate,
                scope: props.scope,
                appId: props.appId
            });
        }

        await em.persistAndFlush(workspace);
        return workspace;
    }

    /**
     * Remove a Slack workspace integration from an organization
     * @param organizationId - The organization ID
     * @param teamId - The Slack team ID
     * @throws {NotFoundException} if workspace not found
     */
    async removeWorkspace(organizationId: string, teamId: string): Promise<void> {
        const em = this._em;

        const workspace = await em.findOne(SlackWorkspaceMetaModel, {
            teamId,
            organization: organizationId
        });

        if (!workspace)
            throw new NotFoundException(`Slack workspace integration not found for team ID: ${teamId} in organization ID: ${organizationId}`);

        await em.removeAndFlush(workspace);
    }

    /**
     * Get workspace configuration for API calls
     * @param teamId - The Slack team ID
     * @returns Workspace configuration or null if not found
     */
    async getWorkspaceConfiguration(teamId: string): Promise<{
        teamId: string;
        teamName: string;
        accessToken: string;
        botUserId: string;
        organizationId: string;
    } | null> {
        const em = this._em;

        const workspace = await em.findOne(SlackWorkspaceMetaModel, {
            teamId
        }, {
            populate: ['organization']
        });

        if (!workspace) {
            return null;
        }

        return {
            teamId: workspace.teamId,
            teamName: workspace.teamName,
            accessToken: workspace.accessToken,
            botUserId: workspace.botUserId,
            organizationId: workspace.organization.id
        };
    }

    /**
     * Update workspace metadata
     * @param teamId - The Slack team ID
     * @param updates - Metadata updates
     * @returns True if updated, false if workspace not found
     */
    async updateWorkspaceMetadata(teamId: string, updates: {
        teamName?: string;
        botUserId?: string;
        lastMetadataRefresh?: Date;
    }): Promise<boolean> {
        const em = this._em;

        const workspace = await em.findOne(SlackWorkspaceMetaModel, {
            teamId
        });

        if (!workspace)
            return false;

        if (updates.teamName !== undefined)
            workspace.teamName = updates.teamName;
        if (updates.botUserId !== undefined)
            workspace.botUserId = updates.botUserId;
        if (updates.lastMetadataRefresh !== undefined)
            workspace.lastRefreshDate = updates.lastMetadataRefresh;

        await em.persistAndFlush(workspace);
        return true;
    }
}
