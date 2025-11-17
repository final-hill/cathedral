import type { NaturalLanguageToRequirementService, SlackService } from '~~/server/data/services'
import { LanguageToolService, ReadabilityAnalysisService, RequirementTypeCorrespondenceService, GlossaryTermIdentificationService } from '~~/server/data/services'
import { Interactor } from '../Interactor'
import type { PermissionInteractor, SlackWorkspaceInteractor, SlackChannelInteractor, SlackUserInteractor } from '..'
import { RequirementInteractor, ReviewInteractor, ReadabilityCheckInteractor, OrganizationCollectionInteractor, AppUserInteractor } from '..'
import type { SlackRepository } from '~~/server/data/repositories'
import { RequirementRepository, OrganizationCollectionRepository, OrganizationRepository, EndorsementRepository } from '~~/server/data/repositories'
import type { z } from 'zod'
import type { slackAppMentionSchema, slackMessageSchema, SlackInteractivePayload, SlackResponseMessage } from '~~/server/data/slack-zod-schemas'
import { slackBodySchema, slackSlashCommandSchema } from '~~/server/data/slack-zod-schemas'
import { ReqType, MismatchException } from '#shared/domain'
import type { ParsedRequirementsType } from '#shared/domain'
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
export class SlackEventInteractor extends Interactor<z.infer<typeof slackBodySchema>, SlackRepository> {
    protected readonly nlrService: NaturalLanguageToRequirementService
    protected readonly permissionInteractor: PermissionInteractor
    protected readonly slackService: SlackService
    protected readonly workspaceInteractor: SlackWorkspaceInteractor
    protected readonly channelInteractor: SlackChannelInteractor
    protected readonly userInteractor: SlackUserInteractor

    /**
     * Constructor for SlackEventInteractor
     * @param props - The properties required to instantiate the interactor
     * @param props.repository - The Slack repository for data access
     * @param props.nlrService - The natural language to requirement service
     * @param props.permissionInteractor - The permission interactor for access control
     * @param props.slackService - The Slack service for sending messages
     * @param props.workspaceInteractor - The Slack workspace interactor
     * @param props.channelInteractor - The Slack channel interactor
     * @param props.userInteractor - The Slack user interactor
     */
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
        this.nlrService = props.nlrService
        this.permissionInteractor = props.permissionInteractor
        this.slackService = props.slackService
        this.workspaceInteractor = props.workspaceInteractor
        this.channelInteractor = props.channelInteractor
        this.userInteractor = props.userInteractor
    }

    /**
     * Assert that the provided Cathedral user ID matches the authenticated user
     * @param cathedralUserId - The Cathedral user ID to validate
     * @throws {MismatchException} When the user IDs don't match
     */
    private assertUserIdentity(cathedralUserId: string): void {
        if (this.permissionInteractor.userId !== cathedralUserId)
            throw new MismatchException('Cathedral user mismatch - authenticated user does not match expected user')
    }

    /**
     * Handle any Slack event (url_verification, event_callback, etc)
     * @param body - The raw body of the Slack event request
     * @returns A promise that resolves to a Slack response message or an empty object
     * @throws {MismatchException} When the event type is unrecognized
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
                        await this.handleAppMention({ data: parsed.event, teamId })
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
     * @param params - The parameters for handling the app mention
     * @param params.data - The Slack app mention event data
     * @param params.teamId - The Slack team ID
     */
    async handleAppMention({ data, teamId }: { data: z.infer<typeof slackAppMentionSchema>, teamId: string }): Promise<void> {
        const statement = data.text.trim(),
            messageKey = `${data.channel}:${data.user}:${data.ts}`

        if (!this.shouldProcessMessage({ data, messageKey })) return

        // Establish transaction boundary
        const em = this.repository['em']

        try {
            const parsedResultsId = await this.processRequirementsParsing({ data, teamId, statement, em })
            if (!parsedResultsId) return

            const channelConfig = await this.channelInteractor.getChannelConfiguration({ channelId: data.channel, teamId })
            if (!channelConfig) return await this.slackService.sendSimpleSuccessMessage({ channel: data.channel, thread_ts: data.ts })

            const cathedralUserId = await this.userInteractor.validateUserAuthentication({ slackUserId: data.user, channelId: data.channel, teamId })
            if (!cathedralUserId) return

            await this.sendSuccessResponse({
                channelId: data.channel,
                parsedResultsId,
                channelConfig,
                cathedralUserId,
                em,
                thread_ts: data.ts
            })
        } catch (error: unknown) {
            console.error('Unexpected error in handleAppMention:', {
                error,
                channel: data.channel,
                user: data.user,
                teamId,
                statement
            })

            await this.slackService.sendUnexpectedError({ channel: data.channel, thread_ts: data.ts })
        }
    }

    /**
     * Handle 'message' events from Slack
     * Called when any message is posted in a channel the bot is present in
     * Currently a no-op, but could be extended for message analysis or other features
     * @param data - The Slack message event data
     */
    async handleMessage(data: z.infer<typeof slackMessageSchema>): Promise<void> {
        // Currently no-op, but could be extended for message analysis
        console.log(`Received message in channel ${data.channel}`)
    }

    /**
     * Handle slash commands from Slack
     * @param body - The raw body of the slash command request
     * @returns A promise that resolves to a Slack response message
     * @throws {MismatchException} When the command is unrecognized
     */
    async handleSlashCommand(body: z.infer<typeof slackSlashCommandSchema>) {
        const parsed = slackSlashCommandSchema.parse(body)

        switch (parsed.command) {
            case '/cathedral':
            case '/cathedral-help':
                return this.slackService.createHelpMessage()
            case '/cathedral-link-user':
                return this.userInteractor.createUserLinkMessage({ slackUserId: parsed.user_id, teamId: parsed.team_id })
            case '/cathedral-unlink-user':
                return this.handleUnlinkUserCommand(parsed)
            case '/cathedral-link-solution':
                return this.handleLinkSolutionCommand(parsed)
            case '/cathedral-unlink-solution':
                return this.handleUnlinkSolutionCommand(parsed)
            default:
                return this.slackService.createUnknownCommandMessage(parsed.command)
        }
    }

    /**
     * Handle organization selection from interactive components
     * @param payload - The Slack interactive payload
     * @returns A promise that resolves to a Slack response message
     * @throws {MismatchException} When required information is missing or invalid
     */
    async handleOrganizationSelectCallback(payload: SlackInteractivePayload) {
        if (!payload.user?.id) throw new MismatchException('Missing user information')

        const cathedralUserId = payload.actions?.[0]?.selected_option?.value
        if (!cathedralUserId) throw new MismatchException('No Cathedral user selected')

        const existingCathedralUserId = await this.userInteractor.getCathedralUserIdForSlackUser({
            slackUserId: payload.user.id,
            teamId: payload.team?.id || ''
        })

        if (existingCathedralUserId) {
            return {
                response_type: 'ephemeral',
                replace_original: true,
                text: '❌ Your Slack account is already linked to a Cathedral user.'
            }
        }

        this.assertUserIdentity(cathedralUserId)

        // Link the Slack user to the Cathedral user
        await this.userInteractor.linkUser({
            slackUserId: payload.user.id,
            teamId: payload.team?.id || '',
            cathedralUserId: cathedralUserId,
            creationDate: new Date(),
            createdById: cathedralUserId // The Cathedral user is the creator of their own link
        })

        return {
            response_type: 'ephemeral',
            replace_original: true,
            text: '✅ Successfully linked your Slack account!'
        }
    }

    /**
     * Handle solution selection from interactive components
     * @param payload - The Slack interactive payload
     * @returns A promise that resolves to a Slack response message
     * @throws {MismatchException} When required information is missing or invalid
     */
    async handleSolutionSelectCallback(payload: SlackInteractivePayload) {
        if (!payload.user?.id || !payload.channel?.id) throw new MismatchException('Missing user or channel information')

        const solutionId = payload.actions?.[0]?.selected_option?.value
        if (!solutionId) throw new MismatchException('No solution selected')

        const cathedralUserId = this.permissionInteractor.userId,
            em = this.repository['em'],
            orgRepo = new OrganizationRepository({ em }),
            solution = await orgRepo.getSolutionById(solutionId).catch((err) => {
                console.error('Failed to get solution by ID:', err)
                return null
            })

        if (!solution) throw new MismatchException('Invalid solution selected. Please try again.')

        this.permissionInteractor.assertOrganizationContributor(solution.organization.id)

        await this.channelInteractor.linkChannelToSolution({
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
     * @param params - The parameters for checking message processing
     * @param params.data - The Slack app mention event data
     * @param params.messageKey - A unique key for the message (channel:user:ts)
     * @returns True if the message should be processed, false otherwise
     */
    private shouldProcessMessage({ data, messageKey }: {
        data: z.infer<typeof slackAppMentionSchema>
        messageKey: string
    }): boolean {
        // Add simple deduplication by checking if we've processed this exact message recently
        const recentProcessedKey = `slack_processed_${messageKey}`

        if (cache.get(recentProcessedKey)) return false

        // Mark this message as being processed (expires in 5 minutes)
        cache.set({ key: recentProcessedKey, value: true, ttl: 5 * 60 })

        // Additional check: ensure this message wasn't sent more than 30 seconds ago
        const messageTimestamp = parseFloat(data.ts),
            currentTime = Date.now() / 1000
        if (currentTime - messageTimestamp > 30) return false

        return true
    }

    /**
     * Process requirements parsing with error handling and validation
     * @param params - The parameters for processing requirements parsing
     * @param params.data - The Slack app mention event data
     * @param params.teamId - The Slack team ID
     * @param params.statement - The requirement statement to parse
     * @param params.em - The entity manager for database operations
     * @returns The ID of the parsed requirements or undefined if processing failed
     */
    private async processRequirementsParsing({
        data,
        teamId,
        statement,
        em
    }: {
        data: z.infer<typeof slackAppMentionSchema>
        teamId: string
        statement: string
        em: SqlEntityManager<PostgreSqlDriver>
    }): Promise<string | undefined> {
        if (!teamId) {
            await this.slackService.sendTeamInfoError({ channel: data.channel, thread_ts: data.ts })
            return undefined
        }

        const channelConfig = await this.channelInteractor.getChannelConfiguration({ channelId: data.channel, teamId })
        if (!channelConfig) {
            await this.slackService.sendChannelNotLinkedError({ channel: data.channel, thread_ts: data.ts })
            return undefined
        }

        const cathedralUserId = this.permissionInteractor.userId

        this.permissionInteractor.assertOrganizationContributor(channelConfig.organizationId)

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
     * @param params - The parameters for parsing requirements
     * @param params.channelConfig - The channel configuration including organization and solution details
     * @param params.cathedralUserId - The Cathedral user ID of the requester
     * @param params.statement - The requirement statement to parse
     * @param params.channelId - The Slack channel ID
     * @param params.em - The entity manager for database operations
     * @param params.thread_ts - (Optional) The thread timestamp to reply in thread
     * @returns The ID of the parsed requirements or undefined if parsing failed
     */
    private async parseRequirementsWithInteractor(params: {
        channelConfig: { organizationId: string, organizationSlug: string, solutionId: string }
        cathedralUserId: string
        statement: string
        channelId: string
        em: SqlEntityManager<PostgreSqlDriver>
        thread_ts?: string
    }): Promise<string | undefined> {
        const { channelConfig, cathedralUserId, statement, channelId, em, thread_ts } = params

        this.assertUserIdentity(cathedralUserId)

        const appUserInteractor = new AppUserInteractor({
                permissionInteractor: this.permissionInteractor,
                entraService: createEntraService()
            }),
            requirementRepository = new RequirementRepository({ em }),
            reviewInteractor = this.createReviewInteractorInstance({
                em,
                organizationId: channelConfig.organizationId,
                organizationSlug: channelConfig.organizationSlug,
                solutionId: channelConfig.solutionId
            }),
            requirementInteractor = new RequirementInteractor({
                repository: requirementRepository,
                permissionInteractor: this.permissionInteractor,
                appUserInteractor,
                reviewInteractor,
                organizationId: channelConfig.organizationId,
                solutionId: channelConfig.solutionId
            })

        try {
            return await requirementInteractor.parseRequirements({
                service: this.nlrService,
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

            await this.slackService.sendParsingError({ channel: channelId, thread_ts })
            return undefined
        }
    }

    /**
     * Send success response with requirements details
     * @param params - The parameters for sending the success response
     * @param params.channelId - The Slack channel ID
     * @param params.parsedResultsId - The ID of the parsed results
     * @param params.channelConfig - The channel configuration including organization and solution details
     * @param params.cathedralUserId - The Cathedral user ID of the requester
     * @param params.em - The entity manager for database operations
     * @param params.thread_ts - (Optional) The thread timestamp to reply in thread
     */
    private async sendSuccessResponse(params: {
        channelId: string
        parsedResultsId: string
        channelConfig: { organizationId: string, organizationSlug: string, solutionId: string, solutionSlug: string, solutionName: string }
        cathedralUserId: string
        em: SqlEntityManager<PostgreSqlDriver>
        thread_ts?: string
    }): Promise<void> {
        const { channelId, parsedResultsId, channelConfig, cathedralUserId, em, thread_ts } = params
        try {
            this.assertUserIdentity(cathedralUserId)

            const appUserInteractor = new AppUserInteractor({
                    permissionInteractor: this.permissionInteractor,
                    entraService: createEntraService()
                }),
                requirementRepository = new RequirementRepository({ em }),
                reviewInteractor = this.createReviewInteractorInstance({
                    em,
                    organizationId: channelConfig.organizationId,
                    organizationSlug: channelConfig.organizationSlug,
                    solutionId: channelConfig.solutionId
                }),
                requirementInteractor = new RequirementInteractor({
                    repository: requirementRepository,
                    permissionInteractor: this.permissionInteractor,
                    appUserInteractor,
                    reviewInteractor,
                    organizationId: channelConfig.organizationId,
                    solutionId: channelConfig.solutionId
                }),
                parsedReqObj = await requirementInteractor.getRequirementTypeById({
                    id: parsedResultsId,
                    reqType: ReqType.PARSED_REQUIREMENTS
                }) as ParsedRequirementsType,
                count = parsedReqObj?.requirements?.length || 0,
                requirementsUrl = this.buildRequirementsUrl({
                    parsedResultsId,
                    orgSlug: channelConfig.organizationSlug,
                    solutionSlug: channelConfig.solutionSlug
                })

            await this.slackService.sendDetailedSuccessMessage({
                channel: channelId,
                count,
                requirementsUrl: requirementsUrl.toString(),
                thread_ts
            })
        } catch (err: unknown) {
            console.error('Failed to fetch parsed requirements details:', {
                error: err,
                parsedResultsId,
                reqType: ReqType.PARSED_REQUIREMENTS,
                cathedralUserId
            })

            await this.slackService.sendSimpleSuccessMessage({ channel: channelId, thread_ts })
        }
    }

    /**
     * Build the requirements URL for the success message
     * @param params - The parameters for building the URL
     * @param params.parsedResultsId - The ID of the parsed results
     * @param params.orgSlug - The organization slug
     * @param params.solutionSlug - The solution slug
     * @returns The constructed URL object
     */
    private buildRequirementsUrl({ parsedResultsId, orgSlug, solutionSlug }: {
        parsedResultsId: string
        orgSlug: string
        solutionSlug: string
    }): URL {
        const config = useRuntimeConfig(),
            urlString = `${config.origin}/o/${orgSlug}/${solutionSlug}/project/requirements-process-report/${parsedResultsId}`

        return new URL(urlString)
    }

    /**
     * Create a ReviewInteractor with all required dependencies
     * Helper method to avoid duplication of service instantiation
     * @param params - The parameters for creating the ReviewInteractor
     * @param params.em - The entity manager for database operations
     * @param params.organizationId - The organization ID
     * @param params.organizationSlug - The organization slug
     * @param params.solutionId - The solution ID
     * @returns A configured ReviewInteractor instance
     */
    // FIXME: this is a hack. compare with the existing `createReviewInteractor` function
    private createReviewInteractorInstance(params: {
        em: SqlEntityManager<PostgreSqlDriver>
        organizationId: string
        organizationSlug: string
        solutionId: string
    }): ReviewInteractor {
        const { em, organizationId, organizationSlug, solutionId } = params,
            config = useRuntimeConfig(),
            requirementRepository = new RequirementRepository({ em }),
            endorsementRepository = new EndorsementRepository({ em }),
            languageToolService = new LanguageToolService({
                baseUrl: config.languagetoolBaseUrl as string || 'http://localhost:8010'
            }),
            readabilityAnalysisService = new ReadabilityAnalysisService(),
            typeCorrespondenceService = new RequirementTypeCorrespondenceService({
                apiKey: config.azureOpenaiApiKey,
                apiVersion: config.azureOpenaiApiVersion,
                endpoint: config.azureOpenaiEndpoint,
                deployment: config.azureOpenaiDeploymentId
            }),
            glossaryTermService = new GlossaryTermIdentificationService({
                apiKey: config.azureOpenaiApiKey,
                apiVersion: config.azureOpenaiApiVersion,
                endpoint: config.azureOpenaiEndpoint,
                deployment: config.azureOpenaiDeploymentId
            }),
            readabilityCheckInteractor = new ReadabilityCheckInteractor({
                languageToolService,
                readabilityService: readabilityAnalysisService,
                typeCorrespondenceService,
                glossaryTermService,
                endorsementRepository,
                requirementRepository
            })

        return new ReviewInteractor({
            permissionInteractor: this.permissionInteractor,
            endorsementRepository,
            requirementRepository,
            readabilityCheckInteractor,
            organizationId,
            solutionId,
            organizationSlug
        })
    }

    /**
     * Handle the unlink user command
     * @param parsed - The parsed command data
     * @returns A promise that resolves to a Slack message
     */
    private async handleUnlinkUserCommand(parsed: z.infer<typeof slackSlashCommandSchema>) {
        try {
            await this.userInteractor.unlinkUser({
                slackUserId: parsed.user_id,
                teamId: parsed.team_id
            })
            return this.slackService.createUserUnlinkSuccessMessage()
        } catch (error: unknown) {
            console.error('Failed to unlink user:', error)
            return this.slackService.createErrorMessage('Failed to unlink user')
        }
    }

    /**
     * Handle the link solution command
     * @param parsed - The parsed command data
     * @returns A promise that resolves to a Slack response message
     */
    private async handleLinkSolutionCommand(parsed: z.infer<typeof slackSlashCommandSchema>): Promise<SlackResponseMessage> {
        const teamId = parsed.team_id,
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

        const cathedralUserId = this.permissionInteractor.userId,
            em = this.repository['em']

        // 1. If no orgId, show org dropdown
        if (!orgId) {
            // Use OrganizationCollectionInteractor to get all orgs user can access
            const entraGroupService = createEntraService(),
                orgCollectionInteractor = new OrganizationCollectionInteractor({
                    repository: new OrganizationCollectionRepository({ em }),
                    permissionInteractor: this.permissionInteractor,
                    entraService: entraGroupService
                }),
                orgs = (await orgCollectionInteractor.findOrganizations()).filter(Boolean)
            if (!orgs || orgs.length === 0) return this.slackService.createErrorMessage('No Cathedral organizations available to link.')

            return this.slackService.createOrganizationDropdown({ organizations: orgs })
        }

        // 2. If orgId but no solutionId, show solution dropdown for org
        if (!solutionId) {
            const solutions = await new OrganizationRepository({ em, organizationId: orgId }).findSolutions({})
            if (!solutions || solutions.length === 0) return this.slackService.createErrorMessage('No solutions available in this organization.')

            return this.slackService.createSolutionDropdown({
                solutions,
                organizationId: orgId,
                actionId: 'cathedral_link_solution_select',
                replaceOriginal: false
            })
        }

        // 3. Both orgId and solutionId present: perform the link
        const orgRepo = new OrganizationRepository({ em }),
            solution = await orgRepo.getSolutionById(solutionId).catch((err) => {
                console.error('Failed to get solution by ID:', err)
                return null
            })
        if (!solution) return this.slackService.createErrorMessage('Invalid solution selected. Please try again.')

        await this.channelInteractor.linkChannelToSolution({
            channelId,
            teamId,
            solutionId,
            createdById: cathedralUserId,
            creationDate: new Date(),
            organizationId: orgId
        })

        return this.slackService.createChannelLinkSuccessMessage({ solutionName: solution.name, replaceOriginal: false })
    }

    /**
     * Handle the unlink solution command
     * Unlinks the current channel from a Cathedral solution
     * @param parsed The parsed Slack command
     * @returns A promise that resolves to a Slack response message
     */
    private async handleUnlinkSolutionCommand(parsed: z.infer<typeof slackSlashCommandSchema>): Promise<SlackResponseMessage> {
        const teamId = parsed.team_id,
            channelId = parsed.channel_id,
            channelMeta = await this.repository.getChannelMeta({ channelId, teamId })
        if (!channelMeta || !channelMeta.solutionId)
            return this.slackService.createChannelNotLinkedMessage()

        // Get the full channel configuration to determine the organization
        const channelConfig = await this.channelInteractor.getChannelConfiguration({ channelId, teamId })
        if (!channelConfig)
            return this.slackService.createChannelNotLinkedMessage()

        this.permissionInteractor.assertOrganizationContributor(channelConfig.organizationId)

        await this.repository.unlinkChannel({ channelId, teamId })
        return this.slackService.createChannelUnlinkSuccessMessage()
    }
}
