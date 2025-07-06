import { Interactor } from '../Interactor'
import type { PermissionInteractor } from '../PermissionInteractor'
import type { SlackRepository } from '~/server/data/repositories'
import type { SlackService } from '~/server/data/services'
import type { SlackChannelMetaType, SlackChannelMetaRepositoryType, SlackChannelMeta } from '#shared/domain/application'
import type { z } from 'zod'
import { NotFoundException } from '~/shared/domain'

/**
 * Slack Channel Interactor
 *
 * Handles channel-level operations for Slack integrations.
 * This interactor manages:
 * - Channel-solution linking/unlinking
 * - Channel metadata and name refresh
 * - Channel discovery and listing
 */
export class SlackChannelInteractor extends Interactor<SlackChannelMetaType> {
    protected readonly _permissionInteractor: PermissionInteractor
    protected readonly _slackService: SlackService

    /**
     * Number of days after which channel/team names are considered stale
     */
    private static readonly STALENESS_THRESHOLD_DAYS = 30

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
     * Determines if channel/team names are stale based on last refresh date
     * @param lastNameRefresh - The date when names were last refreshed from Slack API
     * @returns true if names are considered stale (never refreshed or older than threshold)
     */
    private isNameDataStale(lastNameRefresh?: Date): boolean {
        if (!lastNameRefresh)
            return true

        const now = new Date(),
            thresholdMs = SlackChannelInteractor.STALENESS_THRESHOLD_DAYS * 24 * 60 * 60 * 1000,
            timeSinceRefresh = now.getTime() - lastNameRefresh.getTime()

        return timeSinceRefresh > thresholdMs
    }

    /**
     * Enriches SlackChannelMeta objects with the isStale property based on business rules
     * @param channels - Array of channel metadata from repository
     * @returns Array of enriched channel metadata with isStale property
     */
    private enrichChannelsWithStaleness(channels: SlackChannelMetaRepositoryType[]): z.infer<typeof SlackChannelMeta>[] {
        return channels.map(channel => ({
            ...channel,
            isStale: this.isNameDataStale(channel.lastNameRefresh)
        }))
    }

    /**
     * Link a Slack channel to a Cathedral solution
     *
     * @param props.organizationId - The organization ID
     * @param props.channelId - The Slack channel ID
     * @param props.teamId - The Slack team ID
     * @param props.solutionId - The solution ID to link to
     * @param props.createdById - The user ID of the creator
     * @param props.creationDate - The date when the link was created
     * @throws If the user does not have contributor access
     * @throws If the channel is already linked to another solution
     * @throws If the solution does not exist or is not accessible
     */
    async linkChannelToSolution(props: {
        organizationId: string
        channelId: string
        teamId: string
        solutionId: string
        createdById: string
        creationDate: Date
    }): Promise<void> {
        await this._permissionInteractor.assertOrganizationContributor(props.organizationId)

        const createdByName = await this._permissionInteractor.getCurrentUserName()

        const [channelInfo, teamInfo] = await Promise.all([
            this._slackService.getChannelInfo(props.channelId).catch(() => null),
            this._slackService.getTeamInfo(props.teamId).catch(() => null)
        ])

        await this.repository.linkChannel({
            channelId: props.channelId,
            channelName: channelInfo?.name || props.channelId, // Fallback to ID if name not available
            teamId: props.teamId,
            teamName: teamInfo?.name || props.teamId, // Fallback to ID if name not available
            solutionId: props.solutionId,
            createdById: props.createdById,
            createdByName: createdByName,
            creationDate: props.creationDate,
            lastNameRefresh: new Date() // Mark when names were fetched
        })
    }

    /**
     * Unlink a Slack channel from a Cathedral solution
     *
     * @param organizationId - The organization ID
     * @param channelId - The Slack channel ID
     * @param teamId - The Slack team ID
     * @throws If the user does not have contributor access
     * @throws If the channel is not linked to any solution
     */
    async unlinkChannelFromSolution(organizationId: string, channelId: string, teamId: string): Promise<void> {
        await this._permissionInteractor.assertOrganizationContributor(organizationId)

        // Verify the channel is linked before unlinking
        const channelMeta = await this.repository.getChannelMeta({ channelId, teamId })
        if (!channelMeta || !channelMeta.solutionId) {
            throw new NotFoundException(
                `Channel ${channelId} in team ${teamId} is not linked to any solution.`
            )
        }

        await this.repository.unlinkChannel({ channelId, teamId })
    }

    /**
     * Get all Slack channels linked to a solution
     *
     * @param organizationId - The organization ID
     * @param solutionId - The solution ID
     * @throws If the user does not have read access to the organization
     * @returns Array of channel metadata with staleness information
     */
    async getChannelsForSolution(organizationId: string, solutionId: string): Promise<SlackChannelMetaType[]> {
        await this._permissionInteractor.assertOrganizationReader(organizationId)

        const channels = await this.repository.getChannelsForSolution(solutionId)
        return this.enrichChannelsWithStaleness(channels)
    }

    /**
     * Refresh Slack channel and team names from Slack API
     *
     * @param organizationId - The organization ID
     * @param channelId - The Slack channel ID
     * @param teamId - The Slack team ID
     * @throws If the user does not have contributor access
     * @returns Updated channel metadata with staleness information
     */
    async refreshChannelNames(organizationId: string, channelId: string, teamId: string): Promise<SlackChannelMetaType | null> {
        await this._permissionInteractor.assertOrganizationContributor(organizationId)

        // Fetch fresh names from Slack API
        const [channelInfo, teamInfo] = await Promise.all([
            this._slackService.getChannelInfo(channelId).catch(() => null),
            this._slackService.getTeamInfo(teamId).catch(() => null)
        ])

        const result = await this.repository.refreshChannelNames({
            channelId,
            teamId,
            channelName: channelInfo?.name,
            teamName: teamInfo?.name
        })

        return result ? this.enrichChannelsWithStaleness([result])[0] : null
    }

    /**
     * Get channel configuration for message processing
     *
     * @param channelId - The Slack channel ID
     * @param teamId - The Slack team ID
     * @returns Channel configuration or null if not linked
     */
    async getChannelConfiguration(channelId: string, teamId: string) {
        return await this.repository.getChannelConfiguration({ channelId, teamId })
    }

    /**
     * Get basic channel metadata
     *
     * @param channelId - The Slack channel ID
     * @param teamId - The Slack team ID
     * @returns Basic channel metadata or null if not found
     */
    async getChannelMeta(channelId: string, teamId: string) {
        return await this.repository.getChannelMeta({ channelId, teamId })
    }
}
