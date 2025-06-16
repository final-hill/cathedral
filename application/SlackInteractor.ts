import type { NaturalLanguageToRequirementService, SlackService } from "~/server/data/services";
import { Interactor } from "./Interactor";
import { OrganizationCollectionInteractor, PermissionInteractor, RequirementInteractor } from "./";
import { PermissionRepository, OrganizationRepository, OrganizationCollectionRepository, RequirementRepository, SlackRepository } from "~/server/data/repositories";
import type { z } from "zod";
import jwt from 'jsonwebtoken';
import { slackAppMentionSchema, slackBodySchema, slackMessageSchema, slackSlashCommandSchema, type SlackInteractivePayload } from "~/server/data/slack-zod-schemas";
import type { SlackUserMetaType, SlackChannelMetaType, SlackChannelMeta, SlackChannelMetaRepositoryType } from "#shared/domain/application";
import { ReqType, type ParsedRequirements, PermissionDeniedException } from "#shared/domain";
import cache from "~/server/utils/cache";
import { AppUserModel } from "~/server/data/models";

const { sign } = jwt;
const config = useRuntimeConfig();

export class SlackInteractor extends Interactor<unknown> {
    protected readonly _nlrService: NaturalLanguageToRequirementService;
    protected readonly _permissionInteractor: PermissionInteractor;
    protected readonly _slackService: SlackService;

    /**
     * Business rule: Number of days after which channel/team names are considered stale
     */
    private static readonly STALENESS_THRESHOLD_DAYS = 30;

    constructor(props: {
        repository: SlackRepository,
        nlrService: NaturalLanguageToRequirementService,
        permissionInteractor: PermissionInteractor,
        slackService: SlackService
    }) {
        super({ repository: props.repository });
        this._nlrService = props.nlrService;
        this._permissionInteractor = props.permissionInteractor;
        this._slackService = props.slackService;
    }

    // TODO: This should not be necessary
    // This should be inferred as Repository<SlackRepository>
    get repository(): SlackRepository {
        return this._repository as SlackRepository
    }

    /**
     * Business rule: Determines if channel/team names are stale based on last refresh date
     * @param lastNameRefresh - The date when names were last refreshed from Slack API
     * @returns true if names are considered stale (never refreshed or older than threshold)
     */
    private isNameDataStale(lastNameRefresh?: Date): boolean {
        if (!lastNameRefresh)
            return true;

        const now = new Date();
        const thresholdMs = SlackInteractor.STALENESS_THRESHOLD_DAYS * 24 * 60 * 60 * 1000;
        const timeSinceRefresh = now.getTime() - lastNameRefresh.getTime();

        return timeSinceRefresh > thresholdMs;
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
        }));
    }

    /**
     * Handle any Slack event (url_verification, event_callback, etc)
     */
    async handleEvent(body: unknown) {
        const parsed = slackBodySchema.parse(body);

        switch (parsed.type) {
            case 'url_verification':
                return { challenge: parsed.challenge };
            case 'event_callback': {
                // Ignore bot events to prevent infinite loops from
                // the bot responding to its own messages
                if ((parsed.event as any).bot_id) return {};

                // Extract team_id from authorizations
                const teamId = parsed.authorizations?.[0]?.team_id || "";

                switch (parsed.event.type) {
                    case 'app_mention':
                        // Handle app mention synchronously to prevent duplicate processing
                        await this.handleAppMention(parsed.event, teamId);
                        break;
                    // A message in a channel where the bot is present
                    case 'message':
                        await this.handleMessage(parsed.event).catch(console.error);
                        break;
                    default: break; // Ignore other event types
                }
                return {};
            }
            default:
                throw createError({
                    statusCode: 400,
                    statusMessage: 'Bad Request: Invalid request type',
                    message: `Unhandled request type: ${(parsed as any).type}`
                });
        }
    }

    /**
     * Handle 'app_mention' events from Slack
     * Triggered when the bot is mentioned in a message: `@cathedral some message`
     * This will parse the message as a requirement statement using the NLR service and save it to the appropriate solution.
     */
    async handleAppMention(data: z.infer<typeof slackAppMentionSchema>, teamId: string): Promise<void> {
        const statement = data.text.trim();
        const messageKey = `${data.channel}:${data.user}:${data.ts}`;

        // Early validation and deduplication
        if (!this._shouldProcessMessage(data, messageKey))
            return;

        // Establish transaction boundary
        const em = (this.repository as any)._em;

        try {
            const parsedResultsId = await this._processRequirementsParsing(data, teamId, statement, em);
            if (!parsedResultsId) return;

            // Get channel config for success response
            const channelConfig = await this._getChannelConfiguration(data.channel, teamId);
            if (!channelConfig) {
                await this._slackService.sendSimpleSuccessMessage(data.channel, data.ts);
                return;
            }

            // Get the Cathedral user ID for the success response
            const cathedralUserId = await this._validateUserAuthentication(data.user, data.channel, teamId);
            if (!cathedralUserId) return;

            await this._sendSuccessResponse(data.channel, parsedResultsId, channelConfig, cathedralUserId, em, data.ts);
        } catch (error: any) {
            console.error('Unexpected error in handleAppMention:', {
                error,
                channel: data.channel,
                user: data.user,
                teamId,
                statement
            });

            await this._slackService.sendUnexpectedError(data.channel, data.ts);
        }
    }

    /**
     * Check if the message should be processed (deduplication and age validation)
     */
    private _shouldProcessMessage(
        data: z.infer<typeof slackAppMentionSchema>,
        messageKey: string
    ): boolean {
        // Add simple deduplication by checking if we've processed this exact message recently
        const recentProcessedKey = `slack_processed_${messageKey}`;

        if (cache.get(recentProcessedKey)) {
            console.log('Duplicate message detected, skipping:', messageKey);
            return false;
        }

        // Mark this message as being processed (expires in 5 minutes)
        cache.set(recentProcessedKey, true, { ttl: 5 * 60 });

        // Additional check: ensure this message wasn't sent more than 30 seconds ago
        const messageTimestamp = parseFloat(data.ts);
        const currentTime = Date.now() / 1000;
        if (currentTime - messageTimestamp > 30) {
            console.log('Message too old, skipping:', messageKey, 'age:', currentTime - messageTimestamp, 'seconds');
            return false;
        }

        return true;
    }

    /**
     * Process the requirements parsing workflow
     * Returns the parsed results ID if successful, null if error (already handled)
     */
    private async _processRequirementsParsing(
        data: z.infer<typeof slackAppMentionSchema>,
        teamId: string,
        statement: string,
        em: any
    ): Promise<string | null> {
        // Validate team information
        if (!teamId) {
            await this._slackService.sendTeamInfoError(data.channel, data.ts);
            return null;
        }

        // Get channel configuration
        const channelConfig = await this._getChannelConfiguration(data.channel, teamId);
        if (!channelConfig) {
            await this._slackService.sendChannelNotLinkedError(data.channel, data.ts);
            return null;
        }

        // Validate user authentication
        const cathedralUserId = await this._validateUserAuthentication(data.user, data.channel, teamId, data.ts);
        if (!cathedralUserId) return null;

        // Parse requirements
        return await this._parseRequirementsWithInteractor({
            channelConfig,
            cathedralUserId,
            statement,
            channelId: data.channel,
            em,
            thread_ts: data.ts
        });
    }

    /**
     * Get channel configuration (solution and organization info)
     */
    private async _getChannelConfiguration(channelId: string, teamId: string) {
        return await this.repository.getChannelConfiguration({
            channelId,
            teamId
        });
    }

    /**
     * Validate user authentication and return Cathedral user ID
     */
    private async _validateUserAuthentication(
        slackUserId: string,
        channelId: string,
        teamId: string,
        thread_ts?: string
    ): Promise<string | null> {
        const cathedralUserId = await this.repository
            .getCathedralUserIdForSlackUser({ slackUserId, teamId })
            .catch(() => null);

        if (!cathedralUserId) {
            await this._slackService.sendUserNotLinkedError(channelId, thread_ts);
            return null;
        }

        return cathedralUserId;
    }

    /**
     * Parse requirements using the requirement interactor
     */
    private async _parseRequirementsWithInteractor(params: {
        channelConfig: { organizationId: string, solutionId: string },
        cathedralUserId: string,
        statement: string,
        channelId: string,
        em: any,
        thread_ts?: string
    }): Promise<string | null> {
        const { channelConfig, cathedralUserId, statement, channelId, em, thread_ts } = params;

        // Set up interactors using the provided EntityManager
        const permissionInteractor = new PermissionInteractor({
            userId: cathedralUserId,
            repository: new PermissionRepository({ em })
        });

        const requirementInteractor = new RequirementInteractor({
            repository: new RequirementRepository({ em }),
            permissionInteractor,
            organizationId: channelConfig.organizationId,
            solutionId: channelConfig.solutionId
        });

        try {
            const parsedResultsId = await requirementInteractor.parseRequirements({
                service: this._nlrService,
                name: `Slack Requirements`,
                statement
            });

            return parsedResultsId;
        } catch (err: any) {
            console.error('Failed to parse requirements from Slack message:', {
                error: err,
                statement,
                channel: channelId,
                organizationId: channelConfig.organizationId,
                solutionId: channelConfig.solutionId
            });

            await this._slackService.sendParsingError(channelId, thread_ts);
            return null;
        }
    }

    /**
     * Send success response with requirements details
     */
    private async _sendSuccessResponse(
        channelId: string,
        parsedResultsId: string,
        channelConfig: { organizationId: string, organizationSlug: string, solutionId: string, solutionSlug: string, solutionName: string },
        cathedralUserId: string,
        em: any,
        thread_ts?: string
    ): Promise<void> {
        try {
            // Use the provided EntityManager to ensure we're in the same transaction context
            const permissionInteractor = new PermissionInteractor({
                userId: cathedralUserId,
                repository: new PermissionRepository({ em })
            });

            const requirementInteractor = new RequirementInteractor({
                repository: new RequirementRepository({ em }),
                permissionInteractor,
                organizationId: channelConfig.organizationId,
                solutionId: channelConfig.solutionId
            });

            const parsedReqObj = await requirementInteractor.getRequirementTypeById({
                id: parsedResultsId,
                reqType: ReqType.PARSED_REQUIREMENTS
            }) as z.infer<typeof ParsedRequirements>;

            const count = parsedReqObj?.requirements?.length || 0;

            // Build and validate URL
            try {
                const requirementsUrl = this._buildRequirementsUrl(
                    parsedResultsId,
                    channelConfig.organizationSlug,
                    channelConfig.solutionSlug
                );

                await this._slackService.sendDetailedSuccessMessage(channelId, count, requirementsUrl.toString(), thread_ts);
            } catch (urlError) {
                console.warn('Invalid URL generated for Slack message, falling back to simple success message:', {
                    error: urlError,
                    parsedResultsId,
                    orgSlug: channelConfig.organizationSlug,
                    solutionSlug: channelConfig.solutionSlug
                });
                await this._slackService.sendSimpleSuccessMessage(channelId, thread_ts);
            }
        } catch (err: any) {
            console.error('Failed to fetch parsed requirements details:', {
                error: err,
                parsedResultsId,
                reqType: ReqType.PARSED_REQUIREMENTS,
                cathedralUserId
            });

            await this._slackService.sendSimpleSuccessMessage(channelId, thread_ts);
        }
    }

    /**
     * Build the requirements URL for the success message
     */
    private _buildRequirementsUrl(parsedResultsId: string, orgSlug: string, solutionSlug: string): URL {
        const config = useRuntimeConfig();
        const urlString = `${config.origin}/o/${orgSlug}/${solutionSlug}/project/requirements-process-report/${parsedResultsId}`;

        try {
            const url = new URL(urlString);
            console.log('Building requirements URL:', {
                origin: config.origin,
                orgSlug,
                solutionSlug,
                parsedResultsId,
                finalUrl: url.toString()
            });
            return url;
        } catch (error) {
            console.error('Failed to build valid URL:', {
                origin: config.origin,
                orgSlug,
                solutionSlug,
                parsedResultsId,
                urlString,
                error
            });
            throw error;
        }
    }

    /**
     * Handle 'message' events from Slack.
     * Triggered for any message sent in a channel, group, or direct message where the bot is present
     * This includes all messages, not just those mentioning the bot.
     */
    async handleMessage(data: z.infer<typeof slackMessageSchema>): Promise<void> {
        // Direct message to the bot
        if (data.channel_type === 'im') {
            // ignoring direct messages currently as there is no
            // way to identify the organization/solution in this context
            // to do anything useful with it

            // await this._slackService.postMessage({
            //     channel: data.channel,
            //     text: `message.im received`,
            // });
        }

        // ignore other channel types for now
    }

    /**
     * Handle a Slack slash command (e.g. /cathedral)
     */
    async handleSlashCommand(body: z.infer<typeof slackSlashCommandSchema>) {
        const parsed = slackSlashCommandSchema.parse(body);

        switch (parsed.command) {
            case "/cathedral":
            case "/cathedral-help":
                return this._slackService.createHelpMessage();
            case "/cathedral-link-user":
                return this._handleLinkUserCommand(parsed);
            case "/cathedral-unlink-user":
                return this._handleUnlinkUserCommand(parsed);
            case "/cathedral-link-solution":
                return this._handleLinkSolutionCommand(parsed);
            case "/cathedral-unlink-solution":
                return this._handleUnlinkSolutionCommand(parsed);
            default:
                return this._slackService.createUnknownCommandMessage(parsed.command);
        }
    }

    /**
     * Handle the `/cathedral-link-user` command
     * This command generates a link for the user to connect their Slack account to a Cathedral user.
     * @param parsed - Parsed slash command data
     * @return A response object with the link to connect the account
     */
    private _handleLinkUserCommand(parsed: z.infer<typeof slackSlashCommandSchema>) {
        const token = sign({
            slackUserId: parsed.user_id,
            teamId: parsed.team_id,
            ts: Date.now()
        }, config.slackLinkSecret, { expiresIn: "10m" });
        const baseUrl = config.origin,
            slackLinkUrl = new URL("/auth/slack-link", baseUrl);
        slackLinkUrl.searchParams.set("slackUserId", parsed.user_id);
        slackLinkUrl.searchParams.set("teamId", parsed.team_id);
        slackLinkUrl.searchParams.set("token", token);
        const authUrl = new URL("/auth", baseUrl);
        authUrl.searchParams.set("redirect", slackLinkUrl.pathname + slackLinkUrl.search);
        const link = authUrl.toString();
        return this._slackService.createUserLinkMessage(parsed.user_id, link);
    }

    /**
     * Handle the `/cathedral-unlink-user` command
     * This command unlinks the user's Slack account from their Cathedral account.
     * @param parsed - Parsed slash command data
     * @returns A response object indicating the user has been unlinked
     */
    private async _handleUnlinkUserCommand(parsed: z.infer<typeof slackSlashCommandSchema>) {
        try {
            await this.unlinkUser({
                slackUserId: parsed.user_id,
                teamId: parsed.team_id
            });
            return this._slackService.createUserUnlinkSuccessMessage();
        } catch (error: any) {
            console.error("Failed to unlink user:", error);
            return this._slackService.createErrorMessage("Failed to unlink user");
        }
    }

    /**
     * Handle the `/cathedral-link-solution` command
     * This command allows a user to link a Slack channel to a Cathedral solution.
     * If the user has not yet selected an organization, present a dropdown. If an org is selected but not a solution, present a solution dropdown. If both are selected, perform the link.
     */
    private async _handleLinkSolutionCommand(parsed: z.infer<typeof slackSlashCommandSchema>) {
        const slackUserId = parsed.user_id,
            teamId = parsed.team_id,
            channelId = parsed.channel_id;
        // Parse text for orgId and solutionId (format: orgId:solutionId or orgId or solutionId)
        let orgId = null, solutionId = null;
        if (parsed.text && parsed.text.trim()) {
            const parts = parsed.text.trim().split(":");
            if (parts.length === 2) {
                orgId = parts[0];
                solutionId = parts[1];
            } else if (parts.length === 1) {
                // Could be orgId or solutionId, but we require org first
                orgId = parts[0];
            }
        }
        const cathedralUserId = await this.repository.getCathedralUserIdForSlackUser({ slackUserId, teamId }).catch(() => null);
        if (!cathedralUserId) {
            return this._slackService.createUserLinkRequiredMessage();
        }
        const em = (this.repository as any)._em;
        // 1. If no orgId, show org dropdown
        if (!orgId) {
            // Use OrganizationCollectionInteractor to get all orgs user can access
            const orgCollectionInteractor = new OrganizationCollectionInteractor({
                repository: new OrganizationCollectionRepository({ em }),
                permissionInteractor: new PermissionInteractor({
                    userId: cathedralUserId,
                    repository: new PermissionRepository({ em })
                })
            });
            const orgs = (await orgCollectionInteractor.findOrganizations()).filter(Boolean);
            if (!orgs || orgs.length === 0) {
                return this._slackService.createErrorMessage("No Cathedral organizations available to link.");
            }
            return this._slackService.createOrganizationDropdown(orgs);
        }
        // 2. If orgId but no solutionId, show solution dropdown for org
        if (!solutionId) {
            const solutions = await new OrganizationRepository({ em, organizationId: orgId }).findSolutions({});
            if (!solutions || solutions.length === 0) {
                return this._slackService.createErrorMessage("No solutions available in this organization.");
            }
            return this._slackService.createSolutionDropdown(solutions, orgId, "cathedral_link_solution_select", false);
        }
        // 3. Both orgId and solutionId present: perform the link
        const orgRepo = new OrganizationRepository({ em });
        const solution = await orgRepo.getSolutionById(solutionId).catch(err => {
            console.error("Failed to get solution by ID:", err);
            return null;
        });
        if (!solution) {
            return this._slackService.createErrorMessage("Invalid solution selected. Please try again.");
        }
        await this.linkChannel({
            channelId,
            teamId,
            solutionId,
            createdById: cathedralUserId,
            creationDate: new Date(),
            organizationId: orgId
        });
        return this._slackService.createChannelLinkSuccessMessage(solution.name, false);
    }

    /**
     * Handle the `/cathedral-unlink-solution` command
     * This command allows a user to unlink a Slack channel from a Cathedral solution.
     * @param parsed - Parsed slash command data
     * @returns A response object indicating the channel has been unlinked
     */
    private async _handleUnlinkSolutionCommand(parsed: z.infer<typeof slackSlashCommandSchema>) {
        const slackUserId = parsed.user_id,
            teamId = parsed.team_id,
            channelId = parsed.channel_id;
        // Map Slack user to Cathedral user
        const cathedralUserId = await this.repository.getCathedralUserIdForSlackUser({ slackUserId, teamId }).catch(() => null);
        if (!cathedralUserId) {
            return this._slackService.createUserLinkRequiredMessage();
        }

        const em = (this.repository as any)._em;

        // Find the channel meta first
        const channelMeta = await this.repository.getChannelMeta({ channelId, teamId });
        if (!channelMeta || !channelMeta.solutionId) {
            return this._slackService.createChannelNotLinkedMessage();
        }

        // Get the full channel configuration to determine the organization
        const channelConfig = await this.repository.getChannelConfiguration({ channelId, teamId });
        if (!channelConfig) {
            return this._slackService.createChannelNotLinkedMessage();
        }

        // Check permissions for the organization
        const permissionInteractor = new PermissionInteractor({
            userId: cathedralUserId,
            repository: new PermissionRepository({ em })
        });
        await permissionInteractor.assertOrganizationContributor(channelConfig.organizationId);

        // Unlink the channel
        await this.repository.unlinkChannel({ channelId, teamId });
        return this._slackService.createChannelUnlinkSuccessMessage();
    }

    /**
     * Link slack user to Cathedral user
     * @param props - SlackUserMetaType
     * @throws {NotFoundException} If the Cathedral user does not exist
     * @throws {DuplicateEntityException} If the link already exists
     * @throws {PermissionDeniedException} If the current user is not a system admin or the Slack bot
     */
    async linkUser(props: SlackUserMetaType): Promise<void> {
        await this._permissionInteractor.assertSlackBot();

        this.repository.linkSlackUser({
            slackUserId: props.slackUserId,
            cathedralUserId: props.cathedralUserId,
            teamId: props.teamId,
            createdById: this._permissionInteractor.userId,
            creationDate: new Date()
        })
    }

    /**
     * Unlink slack user from Cathedral user for a given team
     * @param props.slackUserId - The Slack user ID to unlink
     * @param props.teamId - The Slack team ID to unlink from
     * @throws {NotFoundException} If the link does not exist
     * @throws {PermissionDeniedException} If the current user is not a system admin or the Slack bot
     */
    async unlinkUser(props: { slackUserId: string, teamId: string }): Promise<void> {
        await this._permissionInteractor.assertSlackBot();
        await this.repository.unlinkSlackUser(props);
    }

    /**
     * Check if a Slack user is linked to a Cathedral user for a given team
     * @param props.slackUserId - The Slack user ID to check
     * @param props.teamId - The Slack team ID to check against
     * @throws {PermissionDeniedException} If the current user is not a system admin or the Slack bot
     * @returns True if the user is linked, false otherwise
     */
    async isSlackUserLinked(props: { slackUserId: string, teamId: string }): Promise<boolean> {
        await this._permissionInteractor.assertSlackBot();
        return this.repository.isSlackUserLinked(props);
    }

    /**
     * Link a Slack channel to a Cathedral solution
     * @param props.channelId - The Slack channel ID
     * @param props.teamId - The Slack team ID
     * @param props.solutionId - The Cathedral solution ID
     * @param props.createdById - The Cathedral user ID performing the link
     * @param props.creationDate - The date of the link
     * @param props.organizationId - The Cathedral organization ID
     */
    async linkChannel(props: { channelId: string, teamId: string, solutionId: string, createdById: string, creationDate: Date, organizationId: string }): Promise<void> {
        const em = (this.repository as any)._em;
        const permissionInteractor = new PermissionInteractor({
            userId: props.createdById,
            repository: new PermissionRepository({ em })
        });
        await permissionInteractor.assertOrganizationContributor(props.organizationId);

        const user = await em.findOne(AppUserModel, { id: props.createdById });
        const createdByName = user?.name || 'Unknown User';

        // Fetch channel and team information from Slack
        const [channelInfo, teamInfo] = await Promise.all([
            this._slackService.getChannelInfo(props.channelId).catch(() => null),
            this._slackService.getTeamInfo(props.teamId).catch(() => null)
        ]);

        // Use SlackRepository for the actual linking
        await this.repository.linkChannel({
            channelId: props.channelId,
            channelName: channelInfo?.name || props.channelId, // Fallback to ID if name not available
            teamId: props.teamId,
            teamName: teamInfo?.name || props.teamId, // Fallback to ID if name not available
            solutionId: props.solutionId,
            createdById: props.createdById,
            createdByName: createdByName,
            creationDate: props.creationDate,
            lastNameRefresh: new Date(), // Mark when names were fetched
        });
    }

    /**
     * Link a Slack channel to a Cathedral solution with organization validation
     */
    async linkChannelWithOrgValidation(props: { organizationId: string, organizationSlug?: string, channelMeta: SlackChannelMetaType }): Promise<void> {
        const permissionInteractor = new PermissionInteractor({
            userId: props.channelMeta.createdById,
            repository: new PermissionRepository({ em: (this.repository as any)._em })
        });

        // Validate organization access
        const orgRepo = new OrganizationRepository({
            em: (this.repository as any)._em,
            organizationId: props.organizationId,
            organizationSlug: props.organizationSlug
        });
        const org = await orgRepo.getOrganization();
        await permissionInteractor.assertOrganizationContributor(org.id);

        // Use existing linkChannel method
        return this.linkChannel({
            channelId: props.channelMeta.channelId,
            teamId: props.channelMeta.teamId,
            solutionId: props.channelMeta.solutionId,
            createdById: props.channelMeta.createdById,
            creationDate: props.channelMeta.creationDate,
            organizationId: org.id
        });
    }

    /**
     * Unlink a Slack channel from a Cathedral solution with organization validation
     */
    async unlinkChannelWithOrgValidation(props: { organizationId: string, organizationSlug?: string, solutionSlug: string, channelId: string, teamId: string, userId: string }): Promise<void> {
        const permissionInteractor = new PermissionInteractor({
            userId: props.userId,
            repository: new PermissionRepository({ em: (this.repository as any)._em })
        });

        // Validate organization access and get solution
        const orgRepo = new OrganizationRepository({
            em: (this.repository as any)._em,
            organizationId: props.organizationId,
            organizationSlug: props.organizationSlug
        });
        const org = await orgRepo.getOrganization();
        await permissionInteractor.assertOrganizationContributor(org.id);

        // Verify solution exists and user has access
        const solution = await orgRepo.getSolutionBySlug(props.solutionSlug);

        // Delegate to repository
        return this.repository.unlinkChannel({ channelId: props.channelId, teamId: props.teamId });
    }

    /**
     * Refresh Slack channel and team names with organization validation
     */
    async refreshChannelNamesWithOrgValidation(props: { organizationId: string, organizationSlug?: string, solutionSlug: string, channelId: string, teamId: string, userId: string }): Promise<SlackChannelMetaType | null> {
        const permissionInteractor = new PermissionInteractor({
            userId: props.userId,
            repository: new PermissionRepository({ em: (this.repository as any)._em })
        });

        // Validate organization access and get solution
        const orgRepo = new OrganizationRepository({
            em: (this.repository as any)._em,
            organizationId: props.organizationId,
            organizationSlug: props.organizationSlug
        });
        const org = await orgRepo.getOrganization();
        await permissionInteractor.assertOrganizationContributor(org.id);

        // Verify solution exists and user has access
        const solution = await orgRepo.getSolutionBySlug(props.solutionSlug);

        try {
            // Fetch fresh names from Slack API
            const [channelInfo, teamInfo] = await Promise.all([
                this._slackService.getChannelInfo(props.channelId).catch(() => null),
                this._slackService.getTeamInfo(props.teamId).catch(() => null)
            ]);

            // Update repository with fresh names
            const result = await this.repository.refreshChannelNames({
                channelId: props.channelId,
                teamId: props.teamId,
                channelName: channelInfo?.name,
                teamName: teamInfo?.name
            });

            // Enrich with staleness information
            return result ? {
                ...result,
                isStale: this.isNameDataStale(result.lastNameRefresh)
            } : null;
        } catch (error) {
            console.error('Failed to refresh channel names from Slack API:', error);
            // Update timestamp even if API calls failed
            const result = await this.repository.refreshChannelNames({
                channelId: props.channelId,
                teamId: props.teamId
            });

            // Enrich with staleness information
            return result ? {
                ...result,
                isStale: this.isNameDataStale(result.lastNameRefresh)
            } : null;
        }
    }

    /**
     * Get all Slack channels for a solution with organization validation
     */
    async getChannelsForSolutionWithOrgValidation(props: { organizationId?: string, organizationSlug?: string, solutionSlug: string, userId: string }): Promise<SlackChannelMetaType[]> {
        const permissionInteractor = new PermissionInteractor({
            userId: props.userId,
            repository: new PermissionRepository({ em: (this.repository as any)._em })
        });

        // Validate organization access and get solution
        const orgRepo = new OrganizationRepository({
            em: (this.repository as any)._em,
            organizationId: props.organizationId,
            organizationSlug: props.organizationSlug
        });
        const org = await orgRepo.getOrganization();
        await permissionInteractor.assertOrganizationReader(org.id);

        // Verify solution exists and user has access
        const solution = await orgRepo.getSolutionBySlug(props.solutionSlug);

        // Get channels and enrich with staleness
        const channels = await this.repository.getChannelsForSolution(solution.id);
        return this.enrichChannelsWithStaleness(channels);
    }

    // Helper to get Cathedral user ID from Slack user/team
    async getCathedralUserIdForSlackUser({ slackUserId, teamId }: { slackUserId: string, teamId: string }): Promise<string | null> {
        return this.repository.getCathedralUserIdForSlackUser({ slackUserId, teamId });
    }

    /**
     * Handle organization selection from the dropdown in the link solution flow
     */
    public async handleOrganizationSelectCallback(payload: SlackInteractivePayload) {
        try {
            const em = (this.repository as any)._em;
            const slackUserId = payload.user.id;
            const teamId = payload.team.id;

            // Validate that we have the expected action structure
            if (!payload.actions || !payload.actions[0] || !payload.actions[0].selected_option) {
                console.error('Invalid payload structure - missing actions or selected_option');
                return this._slackService.createInvalidSelectionMessage();
            }

            const orgId = payload.actions[0].selected_option.value;

            // 1. Map Slack user to Cathedral user
            const cathedralUserId = await this.repository.getCathedralUserIdForSlackUser({ slackUserId, teamId }).catch(err => {
                console.error("Failed to get Cathedral user ID for Slack user:", err);
                return null;
            });
            if (!cathedralUserId) {
                return this._slackService.createUserLinkRequiredMessage();
            }

            // 2. Get solutions for the selected organization (with organization context)
            const solutions = await new OrganizationRepository({ em, organizationId: orgId }).findSolutions({});

            if (!solutions || solutions.length === 0) {
                return this._slackService.createNoSolutionsMessage();
            }

            // 3. Show solution dropdown (limit to 100 options as per Slack's limit)
            if (solutions.length > 100) {
                console.warn(`Warning: Organization has ${solutions.length} solutions, limiting to 100 for dropdown`);
            }

            // Create solution dropdown using SlackService
            const solutionDropdown = this._slackService.createSolutionDropdown(solutions, orgId);

            // Post using response_url with fallback
            return await this._slackService.postInteractiveResponse(payload.response_url, solutionDropdown);
        } catch (error) {
            console.error('Error in handleOrganizationSelectCallback:', error);
            return this._slackService.createProcessingErrorMessage();
        }
    }

    public async handleSolutionSelectCallback(payload: SlackInteractivePayload) {
        try {
            const em = (this.repository as any)._em;
            const slackUserId = payload.user.id;
            const teamId = payload.team.id;
            const channelId = payload.channel.id;

            // Validate that we have the expected action structure
            if (!payload.actions || !payload.actions[0] || !payload.actions[0].selected_option) {
                console.error('Invalid payload structure - missing actions or selected_option');
                return this._slackService.createInvalidSelectionMessage();
            }

            const selectedValue = payload.actions[0].selected_option.value;

            // Parse orgId:solutionId from the selected value
            const [orgId, solutionId] = selectedValue.split(':');
            if (!orgId || !solutionId) {
                console.error('Invalid selected value format:', selectedValue);
                return this._slackService.createErrorMessage("Invalid selection. Please try again.");
            }

            // 1. Map Slack user to Cathedral user
            const cathedralUserId = await this.repository.getCathedralUserIdForSlackUser({ slackUserId, teamId }).catch(err => {
                console.error("Failed to get Cathedral user ID for Slack user:", err);
                return null;
            });
            if (!cathedralUserId) {
                return this._slackService.createErrorMessage("You must first link your Slack user to a Cathedral user using `/cathedral-link-user`.");
            }

            // 2. Find the selected solution (with organization context)
            // Note: Permission checks are handled by SlackInteractor.linkChannel()
            // which requires OrganizationContributor permission
            const orgRepo = new OrganizationRepository({ em, organizationId: orgId });
            const solution = await orgRepo.getSolutionById(solutionId);
            if (!solution) {
                console.error('Solution not found:', solutionId, 'in organization:', orgId);
                return this._slackService.createErrorMessage("Invalid solution selected. Please try again.");
            }

            // 3. Link the channel to the selected solution
            await this.linkChannel({
                channelId,
                teamId,
                solutionId,
                createdById: cathedralUserId,
                creationDate: new Date(),
                organizationId: orgId
            });

            // Create and post success message using SlackService
            const successMessage = this._slackService.createChannelLinkSuccessMessage(solution.name);
            return await this._slackService.postInteractiveResponse(payload.response_url, successMessage);
        } catch (error) {
            console.error('Error in handleSolutionSelectCallback:', error);
            return this._slackService.createErrorMessage("An error occurred while linking the channel. Please try again.");
        }
    }

    /**
     * Link a Slack user to a Cathedral user (user-level permissions)
     * @param props - SlackUserMetaType
     * @param userPermissionInteractor - PermissionInteractor for the requesting user
     * @throws {NotFoundException} If the Cathedral user does not exist
     * @throws {DuplicateEntityException} If the link already exists
     * @throws {PermissionDeniedException} If the current user is not the user being linked or a system admin
     */
    async linkSlackUserAsUser(props: SlackUserMetaType, userPermissionInteractor: PermissionInteractor): Promise<void> {
        const currentUserId = userPermissionInteractor.userId;
        if (props.cathedralUserId !== currentUserId && !userPermissionInteractor.isSystemAdmin())
            throw new PermissionDeniedException(`User with id ${currentUserId} does not have permission to link Slack user to Cathedral user ${props.cathedralUserId}`);

        await this.repository.linkSlackUser(props);
    }

    /**
     * Unlink a Slack channel from a solution (organization-level)
     * @param props - Object containing solutionSlug, channelId, teamId, and orgRepository
     */
    async unlinkSlackChannelFromSolution(props: { solutionSlug: string, channelId: string, teamId: string, orgRepository: OrganizationRepository }): Promise<void> {
        const org = await props.orgRepository.getOrganization();
        await this._permissionInteractor.assertOrganizationContributor(org.id);

        // Verify the solution exists and user has access
        const solution = await props.orgRepository.getSolutionBySlug(props.solutionSlug);

        await this.repository.unlinkChannel({ channelId: props.channelId, teamId: props.teamId });
    }

    /**
     * Refresh Slack channel and team names from Slack API (organization-level)
     * @param props - Object containing solutionSlug, channelId, teamId, and orgRepository
     * @returns Updated SlackChannelMeta or null if not found
     */
    async refreshSlackChannelNames(props: { solutionSlug: string, channelId: string, teamId: string, orgRepository: OrganizationRepository }): Promise<z.infer<typeof SlackChannelMeta> | null> {
        const org = await props.orgRepository.getOrganization();
        await this._permissionInteractor.assertOrganizationContributor(org.id);

        // Verify the solution exists and user has access
        const solution = await props.orgRepository.getSolutionBySlug(props.solutionSlug);

        try {
            // Fetch fresh names from Slack API
            const [channelInfo, teamInfo] = await Promise.all([
                this._slackService.getChannelInfo(props.channelId).catch(() => null),
                this._slackService.getTeamInfo(props.teamId).catch(() => null)
            ]);

            // Update repository with fresh names
            const result = await this.repository.refreshChannelNames({
                channelId: props.channelId,
                teamId: props.teamId,
                channelName: channelInfo?.name,
                teamName: teamInfo?.name
            });

            // Enrich with staleness information
            return result ? {
                ...result,
                isStale: this.isNameDataStale(result.lastNameRefresh)
            } : null;
        } catch (error) {
            console.error('Failed to refresh channel names from Slack API:', error);
            // Update timestamp even if API calls failed
            const result = await this.repository.refreshChannelNames({
                channelId: props.channelId,
                teamId: props.teamId
            });

            // Enrich with staleness information
            return result ? {
                ...result,
                isStale: this.isNameDataStale(result.lastNameRefresh)
            } : null;
        }
    }

}