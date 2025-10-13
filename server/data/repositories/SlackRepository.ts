import { Repository } from './Repository'
import { SlackChannelMetaModel } from '../models/application/SlackChannelMetaModel'
import { SlackUserMetaModel } from '../models/application'
import { SlackWorkspaceMetaModel } from '../models/application/SlackWorkspaceMetaModel'
import type { SolutionVersionsModel } from '../models/requirements'
import { OrganizationRepository } from './OrganizationRepository'
import type { SlackChannelMetaRepositoryType } from '#shared/domain/application/SlackChannelMeta'
import type { SlackUserMetaType } from '#shared/domain/application'
import { DuplicateEntityException, NotFoundException } from '#shared/domain'

/**
 * Repository for managing Slack-related data operations
 */
export class SlackRepository extends Repository<unknown> {
    /**
     * Get complete Slack channel configuration including organization and solution details
     * @param props.channelId - The Slack channel ID
     * @param props.teamId - The Slack team ID
     * @returns Channel configuration with organization and solution data or null
     */
    async getChannelConfiguration(props: { channelId: string, teamId: string }): Promise<{
        organizationId: string
        organizationSlug: string
        solutionId: string
        solutionSlug: string
        solutionName: string
    } | null> {
        const em = this._em,
            channelMeta = await em.findOne(SlackChannelMetaModel, {
                channelId: props.channelId,
                teamId: props.teamId
            }, {
                populate: ['solution']
            })

        if (!channelMeta || !channelMeta.solution)
            return null

        const solutionModel = channelMeta.solution,
            latestVersion = await solutionModel.getLatestVersion({ effectiveDate: new Date() }) as SolutionVersionsModel | null

        if (!latestVersion?.organization)
            return null

        // Get the organization details
        const organizationId = latestVersion.organization.id,
            orgRepo = new OrganizationRepository({ em, organizationId }),
            solution = await orgRepo.getSolutionById(solutionModel.id),
            org = await orgRepo.getOrganization()

        return {
            organizationId: org.id,
            organizationSlug: org.slug,
            solutionId: solution.id,
            solutionSlug: solution.slug,
            solutionName: solution.name
        }
    }

    /**
     * Get Slack channel metadata for a specific channel and team
     * @param props.channelId - The Slack channel ID
     * @param props.teamId - The Slack team ID
     * @returns The channel metadata or null if not found
     */
    async getChannelMeta(props: { channelId: string, teamId: string }): Promise<{ solutionId: string } | null> {
        const em = this._em,
            meta = await em.findOne(SlackChannelMetaModel, {
                channelId: props.channelId,
                teamId: props.teamId
            }, { populate: ['solution'] })

        if (!meta?.solution) return null

        return { solutionId: meta.solution.id }
    }

    /**
     * Link a Slack channel to a Cathedral solution
     * @param props - SlackChannelMetaRepositoryType properties
     * @throws {DuplicateEntityException} If the channel is already linked
     */
    async linkChannel(props: SlackChannelMetaRepositoryType): Promise<void> {
        const em = this._em,
            existing = await em.findOne(SlackChannelMetaModel, {
                channelId: props.channelId,
                teamId: props.teamId
            })

        if (existing)
            throw new DuplicateEntityException('Channel is already linked to a solution')

        const slackChannelMeta = em.create(SlackChannelMetaModel, {
            channelId: props.channelId,
            channelName: props.channelName,
            teamId: props.teamId,
            teamName: props.teamName,
            solution: props.solutionId,
            createdById: props.createdById,
            creationDate: props.creationDate,
            lastNameRefresh: props.lastNameRefresh
        })

        await em.persistAndFlush(slackChannelMeta)
    }

    /**
     * Unlink a Slack channel from its Cathedral solution
     * @param props.channelId - The Slack channel ID
     * @param props.teamId - The Slack team ID
     * @throws {NotFoundException} If the channel link does not exist
     */
    async unlinkChannel(props: { channelId: string, teamId: string }): Promise<void> {
        const em = this._em,
            existing = await em.findOne(SlackChannelMetaModel, {
                channelId: props.channelId,
                teamId: props.teamId
            })

        if (!existing) throw new NotFoundException('Channel link not found')

        await em.removeAndFlush(existing)
    }

    /**
     * Link a Slack user to a Cathedral user
     * @param props - SlackUserMetaType
     * @throws {DuplicateEntityException} If the link already exists
     * @throws {NotFoundException} If the Cathedral user does not exist
     */
    async linkSlackUser(props: SlackUserMetaType): Promise<void> {
        const em = this._em,
            // Check if the link already exists
            existing = await em.findOne(SlackUserMetaModel, {
                slackUserId: props.slackUserId,
                teamId: props.teamId
            })
        if (existing) throw new DuplicateEntityException(`Slack user ${props.slackUserId} in team ${props.teamId} is already linked to a Cathedral user.`)

        // Create the SlackUserMetaModel
        const slackUserMeta = em.create(SlackUserMetaModel, {
            slackUserId: props.slackUserId,
            teamId: props.teamId,
            appUserId: props.cathedralUserId,
            createdById: props.createdById,
            creationDate: props.creationDate
        })
        await em.persistAndFlush(slackUserMeta)
    }

    /**
     * Unlink a Slack user from a Cathedral user for a given team
     * @param props.slackUserId - The Slack user ID to unlink
     * @param props.teamId - The Slack team ID to unlink from
     * @throws {NotFoundException} If the link does not exist
     */
    async unlinkSlackUser(props: { slackUserId: string, teamId: string }): Promise<void> {
        const em = this._em,
            existing = await em.findOne(SlackUserMetaModel, {
                slackUserId: props.slackUserId,
                teamId: props.teamId
            })
        if (!existing)
            throw new NotFoundException(`No Slack user link found for user ${props.slackUserId} in team ${props.teamId}`)

        await em.removeAndFlush(existing)
    }

    /**
     * Check if a Slack user is linked to a Cathedral user for a given team
     * @param props.slackUserId - The Slack user ID to check
     * @param props.teamId - The Slack team ID to check against
     * @returns True if the user is linked, false otherwise
     */
    async isSlackUserLinked(props: { slackUserId: string, teamId: string }): Promise<boolean> {
        const em = this._em,
            existing = await em.findOne(SlackUserMetaModel, {
                slackUserId: props.slackUserId,
                teamId: props.teamId
            })
        return !!existing
    }

    /**
     * Get Cathedral user ID for a given Slack user and team
     * @param props.slackUserId - Slack user ID
     * @param props.teamId - Slack team ID
     * @returns Cathedral user ID or null if not found
     */
    async getCathedralUserIdForSlackUser({ slackUserId, teamId }: { slackUserId: string, teamId: string }): Promise<string | null> {
        const em = this._em,
            meta = await em.findOne(SlackUserMetaModel, { slackUserId, teamId })
        if (!meta || !meta.appUserId) return null
        return meta.appUserId
    }

    /**
     * Get all Slack user associations for a Cathedral user
     * @param cathedralUserId - The Cathedral user ID
     * @returns Array of Slack user associations
     */
    async getSlackUsersForCathedralUser(cathedralUserId: string): Promise<Array<{
        slackUserId: string
        teamId: string
        teamName: string
        creationDate: Date
    }>> {
        const em = this._em,
            slackUsers = await em.find(SlackUserMetaModel, {
                appUserId: cathedralUserId
            }),
            teamIds = slackUsers.map(user => user.teamId),
            workspaces = await em.find(SlackWorkspaceMetaModel, {
                teamId: { $in: teamIds }
            }),
            workspaceMap = new Map(workspaces.map(workspace => [workspace.teamId, workspace.teamName])),
            result = slackUsers.map(user => ({
                slackUserId: user.slackUserId,
                teamId: user.teamId,
                teamName: workspaceMap.get(user.teamId) || 'Unknown Workspace',
                creationDate: user.creationDate
            }))
        return result
    }

    /**
     * Get all Slack channels linked to a specific solution
     * @param solutionId - The solution ID to get channels for
     * @returns Array of SlackChannelMetaRepositoryType objects
     */
    async getChannelsForSolution(solutionId: string): Promise<SlackChannelMetaRepositoryType[]> {
        const em = this._em,
            channelLinks = await em.find(SlackChannelMetaModel, {
                solution: solutionId
            }, {
                populate: ['createdById']
            })

        return channelLinks.map((link: SlackChannelMetaModel) => ({
            channelId: link.channelId,
            channelName: link.channelName,
            teamId: link.teamId,
            teamName: link.teamName,
            solutionId: solutionId,
            createdById: link.createdById,
            creationDate: link.creationDate,
            lastNameRefresh: link.lastNameRefresh
        }))
    }

    /**
     * Refresh/update channel and team names in the database
     * @param props.channelId - The Slack channel ID
     * @param props.teamId - The Slack team ID
     * @param props.channelName - The new channel name (optional, keeps existing if not provided)
     * @param props.teamName - The new team name (optional, keeps existing if not provided)
     * @returns Updated SlackChannelMeta or null if not found
     */
    async refreshChannelNames(props: {
        channelId: string
        teamId: string
        channelName?: string
        teamName?: string
    }): Promise<SlackChannelMetaRepositoryType | null> {
        const em = this._em,
            existing = await em.findOne(SlackChannelMetaModel, {
                channelId: props.channelId,
                teamId: props.teamId
            }, { populate: ['createdById', 'solution'] })

        if (!existing) return null

        existing.channelName = props.channelName ?? existing.channelName
        existing.teamName = props.teamName ?? existing.teamName
        existing.lastNameRefresh = new Date()

        await em.persistAndFlush(existing)

        return {
            channelId: existing.channelId,
            channelName: existing.channelName,
            teamId: existing.teamId,
            teamName: existing.teamName,
            solutionId: existing.solution.id,
            createdById: existing.createdById,
            creationDate: existing.creationDate,
            lastNameRefresh: existing.lastNameRefresh
        }
    }
}
