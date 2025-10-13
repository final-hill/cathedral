import { Interactor } from '../Interactor'
import type { PermissionInteractor } from '../PermissionInteractor'
import type { SlackRepository } from '~~/server/data/repositories'
import type { SlackService } from '~~/server/data/services'
import type { SlackChannelMetaType, SlackChannelMetaRepositoryType } from '#shared/domain/application'
import { NotFoundException } from '#shared/domain'

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
        if (!lastNameRefresh) return true

        const now = new Date(),
            thresholdMs = SlackChannelInteractor.STALENESS_THRESHOLD_DAYS * 24 * 60 * 60 * 1000,
            timeSinceRefresh = now.getTime() - lastNameRefresh.getTime()

        return timeSinceRefresh > thresholdMs
    }

    /**
     * Enriches SlackChannelMeta objects with the isStale property and user names from Entra
     * @param channels - Array of channel metadata from repository
     * @returns Array of enriched channel metadata with isStale property and user names
     */
    private async enrichChannels(channels: SlackChannelMetaRepositoryType[]): Promise<SlackChannelMetaType[]> {
        return await Promise.all(
            channels.map(async (channel) => {
                let createdByName: string | undefined

                try {
                    const user = await this._permissionInteractor.entraService.getUser(channel.createdById)
                    createdByName = user.name
                } catch (error) {
                    console.warn(`Failed to get user name for ${channel.createdById}:`, error)
                    createdByName = undefined
                }

                return {
                    ...channel,
                    createdByName,
                    isStale: this.isNameDataStale(channel.lastNameRefresh)
                }
            })
        )
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
        this._permissionInteractor.assertOrganizationContributor(props.organizationId)

        const createdByName = this._permissionInteractor.getCurrentUserName(),

            [channelInfo, teamInfo] = await Promise.all([
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
     * @param params - The parameters for unlinking the channel
     * @param params.organizationId - The organization ID
     * @param params.channelId - The Slack channel ID
     * @param params.teamId - The Slack team ID
     * @throws If the user does not have contributor access
     * @throws If the channel is not linked to any solution
     */
    async unlinkChannelFromSolution({ organizationId, channelId, teamId }: {
        organizationId: string
        channelId: string
        teamId: string
    }): Promise<void> {
        this._permissionInteractor.assertOrganizationContributor(organizationId)

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
     * @param params - The parameters for fetching channels
     * @param params.organizationId - The organization ID
     * @param params.solutionId - The solution ID
     * @throws If the user does not have read access to the organization
     * @returns Array of channel metadata with staleness information
     */
    async getChannelsForSolution({ organizationId, solutionId }: { organizationId: string, solutionId: string }): Promise<SlackChannelMetaType[]> {
        this._permissionInteractor.assertOrganizationReader(organizationId)

        const channels = await this.repository.getChannelsForSolution(solutionId)
        return await this.enrichChannels(channels)
    }

    /**
     * Refresh Slack channel and team names from Slack API
     *
     * @param params - The parameters for refreshing channel names
     * @param params.organizationId - The organization ID
     * @param params.channelId - The Slack channel ID
     * @param params.teamId - The Slack team ID
     * @throws If the user does not have contributor access
     * @returns Updated channel metadata with staleness information
     */
    async refreshChannelNames({ organizationId, channelId, teamId }: { organizationId: string, channelId: string, teamId: string }): Promise<SlackChannelMetaType | null> {
        this._permissionInteractor.assertOrganizationContributor(organizationId)

        // Fetch fresh names from Slack API
        const [channelInfo, teamInfo] = await Promise.all([
                this._slackService.getChannelInfo(channelId).catch(() => null),
                this._slackService.getTeamInfo(teamId).catch(() => null)
            ]),
            result = await this.repository.refreshChannelNames({
                channelId,
                teamId,
                channelName: channelInfo?.name,
                teamName: teamInfo?.name
            })

        if (!result) return null

        const enriched = await this.enrichChannels([result]),
            enrichedChannel = enriched[0]
        if (!enrichedChannel) return null

        return enrichedChannel
    }

    /**
     * Get channel configuration for message processing
     *
     * @param params - The parameters for fetching channel configuration
     * @param params.channelId - The Slack channel ID
     * @param params.teamId - The Slack team ID
     * @returns Channel configuration or null if not linked
     */
    async getChannelConfiguration({ channelId, teamId }: { channelId: string, teamId: string }) {
        return await this.repository.getChannelConfiguration({ channelId, teamId })
    }

    /**
     * Get basic channel metadata
     *
     * @param params - The parameters for fetching channel metadata
     * @param params.channelId - The Slack channel ID
     * @param params.teamId - The Slack team ID
     * @returns Basic channel metadata or null if not found
     */
    async getChannelMeta({ channelId, teamId }: { channelId: string, teamId: string }) {
        return await this.repository.getChannelMeta({ channelId, teamId })
    }
}
