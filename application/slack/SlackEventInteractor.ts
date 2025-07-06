import type { NaturalLanguageToRequirementService, SlackService } from '~/server/data/services'
import { Interactor } from '../Interactor'
import { PermissionInteractor, RequirementInteractor, OrganizationCollectionInteractor } from '../'
import type { SlackRepository } from '~/server/data/repositories'
import { PermissionRepository, RequirementRepository, OrganizationCollectionRepository, OrganizationRepository } from '~/server/data/repositories'
import type { z } from 'zod'
import type { slackAppMentionSchema, slackMessageSchema, SlackInteractivePayload, SlackResponseMessage } from '~/server/data/slack-zod-schemas'
import { slackBodySchema, slackSlashCommandSchema } from '~/server/data/slack-zod-schemas'
import { ReqType, PermissionDeniedException, MismatchException } from '#shared/domain'
import type { ParsedRequirements } from '#shared/domain'
import cache from '~/server/utils/cache'
import type { SlackWorkspaceInteractor } from './SlackWorkspaceInteractor'
import type { SlackChannelInteractor } from './SlackChannelInteractor'
import type { SlackUserInteractor } from './SlackUserInteractor'
import type { SqlEntityManager, PostgreSqlDriver } from '@mikro-orm/postgresql'

/**
 * SlackEventInteractor handles all Slack event processing including:
 * - Event dispatching and routing
 * - App mentions and requirement parsing
 * - Message handling
 * - Slash command processing
 * - Interactive component callbacks
 *
 * This interactor coordinates between other Slack interactors for specific domain operations.
 */
export class SlackEventInteractor extends Interactor<z.infer<typeof slackBodySchema>> {
    protected readonly _nlrService: NaturalLanguageToRequirementService
    protected readonly _permissionInteractor: PermissionInteractor
    protected readonly _slackService: SlackService
    protected readonly _workspaceInteractor: SlackWorkspaceInteractor
    protected readonly _channelInteractor: SlackChannelInteractor
    protected readonly _userInteractor: SlackUserInteractor

    constructor(props: {
        repository: SlackRepository
        nlrService: NaturalLanguageToRequirementService
        permissionInteractor: PermissionInteractor
        slackService: SlackService
        workspaceInteractor: SlackWorkspaceInteractor
        channelInteractor: SlackChannelInteractor
        userInteractor: SlackUserInteractor
    }) {
        super({ repository: props.repository })
        this._nlrService = props.nlrService
        this._permissionInteractor = props.permissionInteractor
        this._slackService = props.slackService
        this._workspaceInteractor = props.workspaceInteractor
        this._channelInteractor = props.channelInteractor
        this._userInteractor = props.userInteractor
    }

    // TODO: This should not be necessary
    get repository(): SlackRepository {
        return this._repository as SlackRepository
    }

    /**
     * Handle any Slack event (url_verification, event_callback, etc)
     */
    async handleEvent(body: unknown) {
        const parsed = slackBodySchema.parse(body)

        switch (parsed.type) {
            case 'url_verification':
                return { challenge: parsed.challenge }
            case 'event_callback': {
                // Ignore bot events to prevent infinite loops from
                // the bot responding to its own messages
                if ('bot_id' in parsed.event && parsed.event.bot_id) return {}

                // Extract team_id from authorizations
                const teamId = parsed.authorizations?.[0]?.team_id || ''

                switch (parsed.event.type) {
                    case 'app_mention':
                        // Handle app mention synchronously to prevent duplicate processing
                        await this.handleAppMention(parsed.event, teamId)
                        break
                    // A message in a channel where the bot is present
                    case 'message':
                        await this.handleMessage(parsed.event).catch(console.error)
                        break
                    default: break // Ignore other event types
                }
                return {}
            }
            default:
                throw new MismatchException(`Unhandled request type: ${JSON.stringify(parsed)}`)
        }
    }

    /**
     * Handle 'app_mention' events from Slack
     * Triggered when the bot is mentioned in a message: `@cathedral some message`
     * This will parse the message as a requirement statement using the NLR service and save it to the appropriate solution.
     */
    async handleAppMention(data: z.infer<typeof slackAppMentionSchema>, teamId: string): Promise<void> {
        const statement = data.text.trim(),
            messageKey = `${data.channel}:${data.user}:${data.ts}`

        if (!this.shouldProcessMessage(data, messageKey))
            return

        // Establish transaction boundary
        const em = this.repository['_em']

        try {
            const parsedResultsId = await this.processRequirementsParsing(data, teamId, statement, em)
            if (!parsedResultsId) return

            const channelConfig = await this._channelInteractor.getChannelConfiguration(data.channel, teamId)
            if (!channelConfig) return await this._slackService.sendSimpleSuccessMessage(data.channel, data.ts)

            const cathedralUserId = await this._userInteractor.validateUserAuthentication(data.user, data.channel, teamId)
            if (!cathedralUserId) return

            await this.sendSuccessResponse(data.channel, parsedResultsId, channelConfig, cathedralUserId, em, data.ts)
        } catch (error: unknown) {
            console.error('Unexpected error in handleAppMention:', {
                error,
                channel: data.channel,
                user: data.user,
                teamId,
                statement
            })

            await this._slackService.sendUnexpectedError(data.channel, data.ts)
        }
    }

    /**
     * Handle 'message' events from Slack
     * Called when any message is posted in a channel the bot is present in
     */
    async handleMessage(data: z.infer<typeof slackMessageSchema>): Promise<void> {
        // Currently no-op, but could be extended for message analysis
        console.log(`Received message in channel ${data.channel}`)
    }

    /**
     * Handle slash commands from Slack
     */
    async handleSlashCommand(body: z.infer<typeof slackSlashCommandSchema>) {
        const parsed = slackSlashCommandSchema.parse(body)

        switch (parsed.command) {
            case '/cathedral':
            case '/cathedral-help':
                return this._slackService.createHelpMessage()
            case '/cathedral-link-user':
                return this._userInteractor.createUserLinkMessage(parsed.user_id, parsed.team_id)
            case '/cathedral-unlink-user':
                return this.handleUnlinkUserCommand(parsed)
            case '/cathedral-link-solution':
                return this.handleLinkSolutionCommand(parsed)
            case '/cathedral-unlink-solution':
                return this.handleUnlinkSolutionCommand(parsed)
            default:
                return this._slackService.createUnknownCommandMessage(parsed.command)
        }
    }

    /**
     * Handle organization selection from interactive components
     */
    async handleOrganizationSelectCallback(payload: SlackInteractivePayload) {
        if (!payload.user?.id)
            throw new MismatchException('Missing user information')

        const cathedralUserId = payload.actions?.[0]?.selected_option?.value
        if (!cathedralUserId)
            throw new MismatchException('No Cathedral user selected')

        const existingCathedralUserId = await this._userInteractor.getCathedralUserIdForSlackUser({
            slackUserId: payload.user.id,
            teamId: payload.team?.id || ''
        })

        if (existingCathedralUserId)
            return {
                response_type: 'ephemeral',
                replace_original: true,
                text: '❌ Your Slack account is already linked to a Cathedral user.'
            }

        // Create permission interactor with the Cathedral user being linked to
        const userPermissionInteractor = new PermissionInteractor({
            userId: cathedralUserId,
            repository: new PermissionRepository({
                em: this.repository['_em']
            })
        })

        // Link the Slack user to the selected Cathedral user
        await this._userInteractor.linkSlackUserAsUser({
            slackUserId: payload.user.id,
            teamId: payload.team?.id || '',
            cathedralUserId: cathedralUserId,
            creationDate: new Date(),
            createdById: cathedralUserId // The Cathedral user is the creator of their own link
        }, userPermissionInteractor)

        return {
            response_type: 'ephemeral',
            replace_original: true,
            text: '✅ Successfully linked your Slack account!'
        }
    }

    /**
     * Handle solution selection from interactive components
     */
    async handleSolutionSelectCallback(payload: SlackInteractivePayload) {
        if (!payload.user?.id || !payload.channel?.id)
            throw new MismatchException('Missing user or channel information')

        const solutionId = payload.actions?.[0]?.selected_option?.value
        if (!solutionId)
            throw new MismatchException('No solution selected')

        const cathedralUserId = await this._userInteractor.getCathedralUserIdForSlackUser({
            slackUserId: payload.user.id,
            teamId: payload.team?.id || ''
        })

        if (!cathedralUserId)
            throw new PermissionDeniedException('You must link your Slack account first')

        const em = this.repository['_em']

        // Get the solution details to determine its organization
        const orgRepo = new OrganizationRepository({ em }),
            solution = await orgRepo.getSolutionById(solutionId).catch((err) => {
                console.error('Failed to get solution by ID:', err)
                return null
            })

        if (!solution)
            throw new MismatchException('Invalid solution selected. Please try again.')

        const permissionInteractor = new PermissionInteractor({
            userId: cathedralUserId,
            repository: new PermissionRepository({ em })
        })

        await permissionInteractor.assertOrganizationContributor(solution.organization.id)

        await this._channelInteractor.linkChannelToSolution({
            channelId: payload.channel.id,
            teamId: payload.team?.id || '',
            solutionId,
            createdById: cathedralUserId,
            creationDate: new Date(),
            organizationId: solution.organization.id
        })

        return {
            response_type: 'ephemeral',
            replace_original: true,
            text: `✅ Successfully linked this channel to the solution "${solution.name}"!`
        }
    }

    /**
     * Check if the message should be processed (deduplication and age validation)
     */
    private shouldProcessMessage(
        data: z.infer<typeof slackAppMentionSchema>,
        messageKey: string
    ): boolean {
        // Add simple deduplication by checking if we've processed this exact message recently
        const recentProcessedKey = `slack_processed_${messageKey}`

        if (cache.get(recentProcessedKey))
            return false

        // Mark this message as being processed (expires in 5 minutes)
        cache.set(recentProcessedKey, true, { ttl: 5 * 60 })

        // Additional check: ensure this message wasn't sent more than 30 seconds ago
        const messageTimestamp = parseFloat(data.ts)
        const currentTime = Date.now() / 1000
        if (currentTime - messageTimestamp > 30)
            return false

        return true
    }

    /**
     * Process requirements parsing with error handling and validation
     */
    private async processRequirementsParsing(
        data: z.infer<typeof slackAppMentionSchema>,
        teamId: string,
        statement: string,
        em: SqlEntityManager<PostgreSqlDriver>
    ): Promise<string | undefined> {
        if (!teamId) {
            await this._slackService.sendTeamInfoError(data.channel, data.ts)
            return undefined
        }

        const channelConfig = await this._channelInteractor.getChannelConfiguration(data.channel, teamId)
        if (!channelConfig) {
            await this._slackService.sendChannelNotLinkedError(data.channel, data.ts)
            return undefined
        }

        const cathedralUserId = await this._userInteractor.validateUserAuthentication(data.user, data.channel, teamId)
        if (!cathedralUserId) return

        const permissionInteractor = new PermissionInteractor({
            userId: cathedralUserId,
            repository: new PermissionRepository({ em })
        })

        await permissionInteractor.assertOrganizationContributor(channelConfig.organizationId)

        return await this.parseRequirementsWithInteractor({
            channelConfig,
            cathedralUserId,
            statement,
            channelId: data.channel,
            em,
            thread_ts: data.ts
        })
    }

    /**
     * Parse requirements using the requirement interactor
     */
    private async parseRequirementsWithInteractor(params: {
        channelConfig: { organizationId: string, solutionId: string }
        cathedralUserId: string
        statement: string
        channelId: string
        em: SqlEntityManager<PostgreSqlDriver>
        thread_ts?: string
    }): Promise<string | undefined> {
        const { channelConfig, cathedralUserId, statement, channelId, em, thread_ts } = params

        const permissionInteractor = new PermissionInteractor({
            userId: cathedralUserId,
            repository: new PermissionRepository({ em })
        })

        const requirementInteractor = new RequirementInteractor({
            repository: new RequirementRepository({ em }),
            permissionInteractor,
            organizationId: channelConfig.organizationId,
            solutionId: channelConfig.solutionId
        })

        try {
            return await requirementInteractor.parseRequirements({
                service: this._nlrService,
                name: `Slack Requirements`,
                statement
            })
        } catch (err: unknown) {
            console.error('Failed to parse requirements from Slack message:', {
                error: err,
                statement,
                channel: channelId,
                organizationId: channelConfig.organizationId,
                solutionId: channelConfig.solutionId
            })

            await this._slackService.sendParsingError(channelId, thread_ts)
            return undefined
        }
    }

    /**
     * Send success response with requirements details
     */
    private async sendSuccessResponse(
        channelId: string,
        parsedResultsId: string,
        channelConfig: { organizationId: string, organizationSlug: string, solutionId: string, solutionSlug: string, solutionName: string },
        cathedralUserId: string,
        em: SqlEntityManager<PostgreSqlDriver>,
        thread_ts?: string
    ): Promise<void> {
        try {
            const permissionInteractor = new PermissionInteractor({
                userId: cathedralUserId,
                repository: new PermissionRepository({ em })
            })

            const requirementInteractor = new RequirementInteractor({
                repository: new RequirementRepository({ em }),
                permissionInteractor,
                organizationId: channelConfig.organizationId,
                solutionId: channelConfig.solutionId
            })

            const parsedReqObj = await requirementInteractor.getRequirementTypeById({
                id: parsedResultsId,
                reqType: ReqType.PARSED_REQUIREMENTS
            }) as z.infer<typeof ParsedRequirements>

            const count = parsedReqObj?.requirements?.length || 0,
                requirementsUrl = this.buildRequirementsUrl(
                    parsedResultsId,
                    channelConfig.organizationSlug,
                    channelConfig.solutionSlug
                )

            await this._slackService.sendDetailedSuccessMessage(channelId, count, requirementsUrl.toString(), thread_ts)
        } catch (err: unknown) {
            console.error('Failed to fetch parsed requirements details:', {
                error: err,
                parsedResultsId,
                reqType: ReqType.PARSED_REQUIREMENTS,
                cathedralUserId
            })

            await this._slackService.sendSimpleSuccessMessage(channelId, thread_ts)
        }
    }

    /**
     * Build the requirements URL for the success message
     */
    private buildRequirementsUrl(parsedResultsId: string, orgSlug: string, solutionSlug: string): URL {
        const config = useRuntimeConfig()
        const urlString = `${config.origin}/o/${orgSlug}/${solutionSlug}/project/requirements-process-report/${parsedResultsId}`

        return new URL(urlString)
    }

    /**
     * Handle the unlink user command
     * @param parsed - The parsed command data
     * @returns A promise that resolves to a Slack message
     */
    private async handleUnlinkUserCommand(parsed: z.infer<typeof slackSlashCommandSchema>) {
        try {
            await this._userInteractor.unlinkUser({
                slackUserId: parsed.user_id,
                teamId: parsed.team_id
            })
            return this._slackService.createUserUnlinkSuccessMessage()
        } catch (error: unknown) {
            console.error('Failed to unlink user:', error)
            return this._slackService.createErrorMessage('Failed to unlink user')
        }
    }

    /**
     * Handle the link solution command
     * @param parsed - The parsed command data
     * @returns A promise that resolves to a Slack response message
     */
    private async handleLinkSolutionCommand(parsed: z.infer<typeof slackSlashCommandSchema>): Promise<SlackResponseMessage> {
        const slackUserId = parsed.user_id,
            teamId = parsed.team_id,
            channelId = parsed.channel_id

        // Parse text for orgId and solutionId (format: orgId:solutionId or orgId or solutionId)
        let orgId = null, solutionId = null
        if (parsed.text && parsed.text.trim()) {
            const parts = parsed.text.trim().split(':')
            if (parts.length === 2) {
                orgId = parts[0]
                solutionId = parts[1]
            } else if (parts.length === 1) {
                // Could be orgId or solutionId, but we require org first
                orgId = parts[0]
            }
        }

        const cathedralUserId = await this._userInteractor.getCathedralUserIdForSlackUser({
            slackUserId,
            teamId
        })

        if (!cathedralUserId)
            return this._slackService.createUserLinkRequiredMessage()

        const em = this.repository['_em']

        // 1. If no orgId, show org dropdown
        if (!orgId) {
            // Use OrganizationCollectionInteractor to get all orgs user can access
            const orgCollectionInteractor = new OrganizationCollectionInteractor({
                repository: new OrganizationCollectionRepository({ em }),
                permissionInteractor: new PermissionInteractor({
                    userId: cathedralUserId,
                    repository: new PermissionRepository({ em })
                })
            })
            const orgs = (await orgCollectionInteractor.findOrganizations()).filter(Boolean)
            if (!orgs || orgs.length === 0)
                return this._slackService.createErrorMessage('No Cathedral organizations available to link.')

            return this._slackService.createOrganizationDropdown(orgs)
        }

        // 2. If orgId but no solutionId, show solution dropdown for org
        if (!solutionId) {
            const solutions = await new OrganizationRepository({ em, organizationId: orgId }).findSolutions({})
            if (!solutions || solutions.length === 0)
                return this._slackService.createErrorMessage('No solutions available in this organization.')

            return this._slackService.createSolutionDropdown(solutions, orgId, 'cathedral_link_solution_select', false)
        }

        // 3. Both orgId and solutionId present: perform the link
        const orgRepo = new OrganizationRepository({ em })
        const solution = await orgRepo.getSolutionById(solutionId).catch((err) => {
            console.error('Failed to get solution by ID:', err)
            return null
        })
        if (!solution)
            return this._slackService.createErrorMessage('Invalid solution selected. Please try again.')

        await this._channelInteractor.linkChannelToSolution({
            channelId,
            teamId,
            solutionId,
            createdById: cathedralUserId,
            creationDate: new Date(),
            organizationId: orgId
        })

        return this._slackService.createChannelLinkSuccessMessage(solution.name, false)
    }

    /**
     * Handle the unlink solution command
     * Unlinks the current channel from a Cathedral solution
     * @param parsed The parsed Slack command
     * @returns A promise that resolves to a Slack response message
     */
    private async handleUnlinkSolutionCommand(parsed: z.infer<typeof slackSlashCommandSchema>): Promise<SlackResponseMessage> {
        const slackUserId = parsed.user_id,
            teamId = parsed.team_id,
            channelId = parsed.channel_id

        const cathedralUserId = await this._userInteractor.getCathedralUserIdForSlackUser({
            slackUserId,
            teamId
        })

        if (!cathedralUserId)
            return this._slackService.createUserLinkRequiredMessage()

        const em = this.repository['_em']

        // Find the channel meta first
        const channelMeta = await this.repository.getChannelMeta({ channelId, teamId })
        if (!channelMeta || !channelMeta.solutionId) {
            return this._slackService.createChannelNotLinkedMessage()
        }

        // Get the full channel configuration to determine the organization
        const channelConfig = await this._channelInteractor.getChannelConfiguration(channelId, teamId)
        if (!channelConfig) {
            return this._slackService.createChannelNotLinkedMessage()
        }

        // Check permissions for the organization
        const permissionInteractor = new PermissionInteractor({
            userId: cathedralUserId,
            repository: new PermissionRepository({ em })
        })
        await permissionInteractor.assertOrganizationContributor(channelConfig.organizationId)

        await this.repository.unlinkChannel({ channelId, teamId })
        return this._slackService.createChannelUnlinkSuccessMessage()
    }
}
