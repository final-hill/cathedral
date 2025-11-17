import type { RequirementType } from '../../../shared/domain/requirements/index.js'
import type { ReqType, EndorsementCategory, EndorsementStatus, EndorsementType } from '../../../shared/domain/index.js'
import type { EndorsementRepository } from '../../data/repositories/EndorsementRepository.js'
import type { RequirementRepository } from '../../data/repositories/RequirementRepository.js'

/**
 * Result from a single automated check
 * @template TDetails - The type of the details object for this check
 * @template TCheckType - The enum or string type for check type identifiers (e.g., ReadabilityCheckType)
 */
export interface AutomatedCheckResult<TDetails = Record<string, unknown>, TCheckType = string> {
    /** Unique identifier for this check type (category-specific enum value or string) */
    checkType: TCheckType
    /** Status: APPROVED, REJECTED, or PENDING (for failures) */
    status: EndorsementStatus
    /** Human-readable check name */
    title: string
    /** Summary description of the result */
    description: string
    /** Detailed check-specific data */
    details: TDetails
}

/**
 * Context provided to check interactors
 */
export interface CheckContext {
    requirement: RequirementType
    organizationSlug: string
    solutionId: string
}

/**
 * Base abstract class for all automated check interactors
 *
 * Each review category (READABILITY, CORRECTNESS, CONSISTENCY, etc.) extends this class
 * to leverage shared orchestration patterns while implementing category-specific logic.
 *
 */
export abstract class BaseAutomatedCheckInteractor {
    protected readonly endorsementRepository: EndorsementRepository
    protected readonly requirementRepository: RequirementRepository

    constructor(props: {
        endorsementRepository: EndorsementRepository
        requirementRepository: RequirementRepository
    }) {
        this.endorsementRepository = props.endorsementRepository
        this.requirementRepository = props.requirementRepository
    }

    /**
     * Perform all checks for this category
     * Each category implements its own check logic
     * @param context - Requirement and context information
     * @returns Array of check results
     */
    abstract performChecks(context: CheckContext): Promise<AutomatedCheckResult[]>

    /**
     * Get the endorsement category for this interactor
     * @returns The category enum value
     */
    protected abstract getCategory(): EndorsementCategory

    /**
     * Create review items (endorsements) from check results
     * Standardized persistence logic shared across all categories
     * @param props - Persistence parameters
     */
    async createReviewItems(props: {
        requirementId: string
        reqType: ReqType
        checks: AutomatedCheckResult[]
        systemActorId: null // Automated checks have no actor
    }): Promise<void> {
        const { requirementId, reqType, checks } = props,
            category = this.getCategory()

        for (const check of checks) {
            await this.endorsementRepository.create({
                requirementId,
                reqType,
                endorsedBy: null, // Automated checks have no actor
                category,
                status: check.status,
                comments: undefined, // Automated checks don't have comments
                checkDetails: {
                    checkType: check.checkType,
                    title: check.title,
                    description: check.description,
                    retryCount: 0,
                    ...check.details
                }
            })
        }
    }

    /**
     * Update existing review items (endorsements) with check results
     * Used to replace placeholder PENDING endorsements with actual results
     * @param props - Update parameters
     */
    async updateReviewItems(props: {
        requirementId: string
        reqType: ReqType
        checks: AutomatedCheckResult[]
    }): Promise<void> {
        const { requirementId, reqType, checks } = props,
            category = this.getCategory(),
            checkTypes = checks.map(c => c.checkType as string),
            // Find existing endorsements to preserve retry count
            existingEndorsements = await this.endorsementRepository.findByRequirementInReview(requirementId)

        // Delete placeholder endorsements
        await this.endorsementRepository.deleteAutomatedChecks({
            requirementId,
            reqType,
            category,
            checkTypes
        })

        // Create new endorsements with actual results
        for (const check of checks) {
            // Find the matching placeholder to preserve retry count
            const existing = existingEndorsements.find(e =>
                e.category === category
                && (e.checkDetails?.checkType as string) === check.checkType
            )

            await this.endorsementRepository.create({
                requirementId,
                reqType,
                endorsedBy: null,
                category,
                status: check.status,
                comments: undefined,
                checkDetails: {
                    checkType: check.checkType,
                    title: check.title,
                    description: check.description,
                    retryCount: existing ? ((existing.checkDetails?.retryCount as number | undefined) || 0) : 0,
                    ...check.details
                }
            })
        }
    }

    /**
     * Retry failed checks for this category
     * Standardized retry logic shared across all categories
     * @param props - Retry parameters
     * @returns Updated check results for failed checks
     */
    async retryFailedChecks(props: {
        requirementId: string
        reqType: ReqType
        organizationSlug: string
        systemActorId: null // Automated checks have no actor
    }): Promise<AutomatedCheckResult[]> {
        const { requirementId, reqType, organizationSlug } = props,
            category = this.getCategory(),
            // Load the requirement
            requirement = await this.requirementRepository.getById(requirementId),
            // Find existing endorsements for this category
            endorsements = await this.endorsementRepository.findByRequirementInReview(requirementId),
            categoryEndorsements = endorsements.filter((e: EndorsementType) =>
                e.category === category && !e.endorsedBy // Automated checks have no endorsedBy
            ),
            // Identify failed checks (REJECTED status)
            failedChecks = categoryEndorsements.filter((e: EndorsementType) => e.status === 'rejected' as EndorsementStatus)

        if (failedChecks.length === 0)
            return [] // No failed checks to retry

        // Get solutionId from requirement
        if (!requirement.solution?.id)
            throw new Error('Requirement must belong to a solution for automated checks')

        // Re-run all checks for this category
        const newResults = await this.performChecks({
            requirement,
            organizationSlug,
            solutionId: requirement.solution.id
        })

        // Update endorsements with new results and increment retry count
        for (const failedCheck of failedChecks) {
            const checkType = failedCheck.checkDetails?.checkType
            if (!checkType) continue

            // Find corresponding new result
            const newResult = newResults.find(r => r.checkType === checkType)
            if (!newResult) continue

            // Update the endorsement
            await this.endorsementRepository.create({
                requirementId,
                reqType,
                endorsedBy: null, // Automated checks have no actor
                category,
                status: newResult.status,
                comments: undefined,
                checkDetails: {
                    checkType: newResult.checkType,
                    title: newResult.title,
                    description: newResult.description,
                    retryCount: ((failedCheck.checkDetails?.retryCount as number | undefined) || 0) + 1,
                    ...newResult.details
                }
            })
        }

        return newResults.filter(r =>
            failedChecks.some((fc: EndorsementType) => fc.checkDetails?.checkType === r.checkType)
        )
    }

    /**
     * Extract analyzable text from requirement based on type
     *
     * Shared utility method for text-based analysis that extracts content from
     * type-specific fields. This is used by readability, grammar, and other
     * text-based automated checks.
     *
     * Field extraction by requirement type:
     * - All types: name, description (from Requirement base)
     * - No additional fields needed - all content is in name/description
     *
     * Note: Most requirement types only have name and description fields.
     * The domain models use references to other requirements rather than
     * embedding text in additional fields.
     *
     * @param requirement - The requirement to extract text from
     * @returns Concatenated text from all analyzable fields, joined with double newlines
     */
    protected extractAnalyzableText(requirement: RequirementType): string {
        const fields: string[] = []

        // All requirement types have name and description from the base Requirement class
        if ('name' in requirement && typeof requirement.name === 'string')
            fields.push(requirement.name)

        if ('description' in requirement && typeof requirement.description === 'string')
            fields.push(requirement.description)

        // All domain models inherit from Requirement and only add metadata fields
        // (references, dates, booleans, etc.) - no additional text fields to analyze

        return fields.filter(Boolean).join('\n\n')
    }

    /**
     * Create a failed check result when a service throws an error
     * Standardized error handling
     * @param props - Error details
     * @returns Check result with PENDING status
     */
    protected createFailedCheckResult<TCheckType = string>(props: {
        checkType: TCheckType
        title: string
        error: string
    }): AutomatedCheckResult<Record<string, unknown>, TCheckType> {
        const { checkType, title, error } = props
        return {
            checkType,
            status: 'pending' as EndorsementStatus,
            title,
            description: `Check failed: ${error}`,
            details: {
                checkType: checkType as unknown as string,
                errorMessage: error
            }
        }
    }
}
