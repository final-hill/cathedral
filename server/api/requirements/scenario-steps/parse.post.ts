/**
 * API endpoint for parsing scenario steps from HTML content using AI.
 *
 * This endpoint accepts HTML content containing scenario steps (typically from a rich text editor)
 * and uses Azure OpenAI to parse and structure them into hierarchical scenario steps with proper
 * numbering and step type classification.
 *
 * @route POST /api/requirements/scenario-steps/parse
 *
 * @param {string} htmlContent - The HTML content to parse for scenario steps
 * @param {string} solutionSlug - The slug of the solution (for context and permissions)
 * @param {string} organizationId - Optional organization ID (alternative to organizationSlug)
 * @param {string} organizationSlug - Optional organization slug (alternative to organizationId)
 *
 * @returns {object} Response object containing:
 * - `parsed: boolean` - Whether the content was successfully parsed as scenario steps
 * - `suggestions?: ScenarioStepSuggestionType[]` - Array of structured scenario steps (if parsed)
 * - `error?: string` - Error message if content cannot be interpreted as scenario steps
 *
 * @throws {403} If user lacks contributor permissions for the organization
 * @throws {400} If request body validation fails
 * @throws {404} If organization or solution is not found
 * @throws {500} If AI service fails or other internal errors occur
 *
 * @example
 * ```typescript
 * // Request
 * POST /api/requirements/scenario-steps/parse
 * {
 *   "htmlContent": "<ol><li>User enters login credentials</li><li>System validates data</li></ol>",
 *   "organizationSlug": "acme-corp",
 *   "solutionSlug": "user-portal"
 * }
 *
 * // Success Response
 * {
 *   "parsed": true,
 *   "suggestions": [
 *     {
 *       "reqType": "scenario_step",
 *       "name": "User enters login credentials",
 *       "stepNumber": "1",
 *       "stepType": "Action"
 *     }
 *   ]
 * }
 *
 * // Unparseable Content Response
 * {
 *   "parsed": false,
 *   "error": "The provided content cannot be interpreted as scenario steps...",
 *   "suggestions": []
 * }
 * ```
 */
import { defineEventHandler, readBody } from 'h3'
import { RequirementInteractor, PermissionInteractor, AppUserInteractor, OrganizationInteractor } from '~/application'
import { RequirementRepository, OrganizationRepository } from '~/server/data/repositories'
import { ScenarioStepParsingService } from '~/server/data/services/ScenarioStepParsingService'
import { createEntraService } from '~/server/utils/createEntraService'
import { MismatchException } from '~/shared/domain/exceptions'
import { z } from 'zod'
import { Solution, Organization } from '~/shared/domain'

const { id: organizationId, slug: organizationSlug } = Organization.innerType().pick({ id: true, slug: true }).partial().shape,
    bodySchema = z.object({
        htmlContent: z.string(),
        solutionSlug: Solution.innerType().pick({ slug: true }).shape.slug,
        organizationId,
        organizationSlug
    }).refine((value) => {
        return value.organizationId !== undefined || value.organizationSlug !== undefined
    }, 'At least one of organizationId or organizationSlug should be provided')

export default defineEventHandler(async (event) => {
    const body = await readBody(event),
        { htmlContent, solutionSlug, organizationId, organizationSlug } = await bodySchema.parseAsync(body),
        session = await requireUserSession(event),
        entraService = createEntraService(),
        permissionInteractor = new PermissionInteractor({ event, session, entraService }),
        appUserInteractor = new AppUserInteractor({ permissionInteractor, entraService }),
        organizationInteractor = new OrganizationInteractor({
            repository: new OrganizationRepository({ em: event.context.em, organizationId, organizationSlug }),
            permissionInteractor,
            appUserInteractor
        }),
        org = await organizationInteractor.getOrganization(),
        solution = await organizationInteractor.getSolutionBySlug(solutionSlug),
        requirementInteractor = new RequirementInteractor({
            repository: new RequirementRepository({ em: event.context.em }),
            permissionInteractor,
            appUserInteractor,
            organizationId: org.id,
            solutionId: solution.id
        }),
        runtimeConfig = useRuntimeConfig(),
        scenarioStepService = new ScenarioStepParsingService({
            apiKey: runtimeConfig.azureOpenaiApiKey,
            apiVersion: runtimeConfig.azureOpenaiApiVersion,
            endpoint: runtimeConfig.azureOpenaiEndpoint,
            deployment: runtimeConfig.azureOpenaiDeploymentId
        })

    try {
        try {
            const parsedSteps = await requirementInteractor.parseScenarioSteps(htmlContent, scenarioStepService)

            return {
                parsed: true,
                suggestions: parsedSteps
            }
        } catch (error) {
            if (error instanceof MismatchException) {
                return {
                    parsed: false,
                    error: error.message,
                    suggestions: []
                }
            }

            // Re-throw other errors
            throw error
        }
    } catch (error) {
        throw createError({
            statusCode: 500,
            statusMessage: `Failed to parse scenario steps: ${error instanceof Error ? error.message : 'Unknown error'}`
        })
    }
})
