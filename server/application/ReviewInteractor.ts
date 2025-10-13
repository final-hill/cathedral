import { validate as validateUuid } from 'uuid'
import * as req from '#shared/domain/requirements'
import { ReqType, WorkflowState, ReviewStatus, ReviewCategory, EndorsementStatus, EndorsementCategory, InvalidWorkflowStateException, MismatchException, NotFoundException } from '#shared/domain'
import type { ReviewStateType, EndorsementType, AuditMetadataType } from '#shared/domain'
import type { PendingReviewDtoType } from '#shared/dto/PendingReviewDto'
import type { PermissionInteractor } from './index'
import type { EndorsementRepository, RequirementRepository } from '../data/repositories'
import { z } from 'zod'

/**
 * ReviewInteractor handles all review and endorsement-related business logic
 * Extracted from RequirementInteractor to provide focused review operations
 */
export class ReviewInteractor {
    private readonly _permissionInteractor: PermissionInteractor
    private readonly _endorsementRepository: EndorsementRepository
    private readonly _requirementRepository: RequirementRepository
    private readonly _solutionId: string
    private readonly _organizationId: string

    /**
     * Create a new ReviewInteractor
     */
    constructor(props: {
        permissionInteractor: PermissionInteractor
        endorsementRepository: EndorsementRepository
        requirementRepository: RequirementRepository
        solutionId: string
        organizationId: string
    }) {
        this._permissionInteractor = props.permissionInteractor
        this._endorsementRepository = props.endorsementRepository
        this._requirementRepository = props.requirementRepository
        this._solutionId = props.solutionId
        this._organizationId = props.organizationId
    }

    /**
     * Get structured review status for a requirement including endorsements and other review items
     * @param requirementId The requirement to get review status for
     * @returns Review state with items and overall status
     * @throws {PermissionDeniedException} If the user is not a reader of the organization
     */
    async getReviewState(requirementId: string): Promise<ReviewStateType> {
        this._permissionInteractor.assertOrganizationReader(this._organizationId)

        const endorsements = await this._endorsementRepository.findByRequirementInReview(requirementId),
            // Transform endorsements to review items with proper business logic
            endorsementItems = endorsements.map((endorsement) => {
                const isRoleBased = endorsement.category === EndorsementCategory.ROLE_BASED,
                    categoryTitle = this.getEndorsementCategoryTitle(endorsement.category)

                return {
                    id: endorsement.id,
                    category: ReviewCategory.ENDORSEMENT,
                    title: isRoleBased
                        ? `${endorsement.endorsedBy.name} Endorsement`
                        : `${categoryTitle} Check`,
                    description: isRoleBased
                        ? `Endorsement by ${endorsement.endorsedBy.name}`
                        : `Automated ${categoryTitle.toLowerCase()} validation`,
                    status: endorsement.status as unknown as ReviewStatus,
                    isRequired: true,
                    canUserReview: isRoleBased // Only role-based endorsements can be manually reviewed
                }
            }),
            automatedItems = this.getAutomatedReviewCategories(requirementId),
            items = [...endorsementItems, ...automatedItems],
            // Compute overall status
            overall = this.computeOverallReviewStatus(items)

        return {
            overall,
            items
        }
    }

    /**
     * TODO: Future implementation
     * Get placeholder automated review categories
     * These will be replaced with actual automated validation in future iterations
     * @param requirementId The requirement being reviewed (unused for now)
     * @returns Array of placeholder review items for automated categories
     */
    private getAutomatedReviewCategories(_requirementId: string): Array<{
        id: string
        category: ReviewCategory
        title: string
        description: string
        status: ReviewStatus
        isRequired: boolean
        canUserReview: boolean
    }> {
        const categories = [
            {
                category: ReviewCategory.CORRECTNESS,
                title: 'Correctness',
                description: 'Correctness ensures that the requirement is grammatically correct, semantically valid, and free from logical errors.'
            },
            {
                category: ReviewCategory.JUSTIFIABILITY,
                title: 'Justifiability',
                description: 'Justifiability ensures that the requirement provides clear reasoning and business value that justifies its inclusion.'
            },
            {
                category: ReviewCategory.COMPLETENESS,
                title: 'Completeness',
                description: 'Completeness ensures that the requirement contains all necessary information and properly references all dependencies.'
            },
            {
                category: ReviewCategory.CONSISTENCY,
                title: 'Consistency',
                description: 'Consistency ensures that the requirement maintains alignment with established patterns, terminology, and solution architecture.'
            },
            {
                category: ReviewCategory.NON_AMBIGUITY,
                title: 'Non-Ambiguity',
                description: 'Non-ambiguity ensures that the requirement has only one possible interpretation and cannot be misunderstood.'
            },
            {
                category: ReviewCategory.FEASIBILITY,
                title: 'Feasibility',
                description: 'Feasibility ensures that the requirement can realistically be implemented within technical, resource, and schedule constraints.'
            },
            {
                category: ReviewCategory.TRACEABILITY,
                title: 'Traceability',
                description: 'Traceability ensures that the requirement can be traced to its origin and linked to related requirements and implementations.'
            },
            {
                category: ReviewCategory.VERIFIABILITY,
                title: 'Verifiability',
                description: 'Verifiability ensures that the requirement includes criteria that make it possible to verify when it has been satisfied.'
            },
            {
                category: ReviewCategory.ABSTRACTNESS,
                title: 'Abstractness',
                description: 'Abstractness ensures that the requirement specifies desired system properties without prescribing or favoring specific design or implementation choices.'
            },
            {
                category: ReviewCategory.DELIMITEDNESS,
                title: 'Delimitedness',
                description: 'Delimitedness ensures that the requirement clearly defines system scope and makes it possible to determine what functionality lies beyond that scope.'
            },
            {
                category: ReviewCategory.READABILITY,
                title: 'Readability',
                description: 'Readability ensures that the requirement is clear, well-written, and easily understandable by stakeholders.'
            },
            {
                category: ReviewCategory.MODIFIABILITY,
                title: 'Modifiability',
                description: 'Modifiability ensures that the requirement can be changed without excessive impact to the system or other requirements.'
            },
            {
                category: ReviewCategory.PRIORITIZATION,
                title: 'Prioritization',
                description: 'Prioritization ensures that the requirement has appropriate priority levels and ordering relative to other requirements.'
            }
        ]

        return categories.map(({ category, title, description }) => ({
            id: `${category.toLowerCase()}-check`,
            category,
            title: `${title} Check`,
            description,
            status: ReviewStatus.APPROVED, // Default to approved for placeholder items
            isRequired: false, // Automated checks are not required for now
            canUserReview: false // These are automated, not manual
        }))
    }

    /**
     * Get all pending endorsements for a solution that need review
     * @returns Array of pending endorsements with requirement context
     * @throws {PermissionDeniedException} If the user is not a reader of the organization
     */
    async getPendingEndorsementsForSolution(): Promise<PendingReviewDtoType[]> {
        this._permissionInteractor.assertOrganizationReader(this._organizationId)

        const pendingEndorsements = await this._endorsementRepository.getPendingEndorsements(this._solutionId),
            pendingReviews = []

        // Transform endorsements into pending review items with requirement context
        for (const endorsement of pendingEndorsements) {
            const requirementVersion = endorsement.requirementVersion
            if (requirementVersion) {
                const requirement = await this._requirementRepository.getById(requirementVersion.requirementId)

                pendingReviews.push({
                    endorsement,
                    requirement: {
                        id: requirement.id,
                        name: requirement.name,
                        reqType: requirement.reqType,
                        workflowState: requirement.workflowState,
                        lastModified: requirement.lastModified,
                        reqIdPrefix: requirement.reqIdPrefix,
                        uiBasePathTemplate: requirement.uiBasePathTemplate
                    }
                })
            }
        }

        return pendingReviews
    }

    /**
     * Get all endorsements for the latest version of a requirement
     * @param requirementId - The requirement ID
     * @returns Array of endorsements for the latest version
     * @throws {PermissionDeniedException} If the user is not a reader of the organization
     */
    async getEndorsements(requirementId: string): Promise<EndorsementType[]> {
        this._permissionInteractor.assertOrganizationReader(this._organizationId)

        return this._endorsementRepository.findByRequirementInReview(requirementId)
    }

    /**
     * Endorse a requirement as the current authenticated user
     * @param input - The endorsement input parameters
     * @param input.requirementId - The requirement ID
     * @param input.comments - Optional endorsement comments
     * @throws {PermissionDeniedException} If the user is not a contributor of the organization
     * @throws {MismatchException} If user cannot endorse (no Person entity found or no endorsement permissions)
     * @throws {InvalidWorkflowStateException} If requirement is not in Review state or endorsement already processed
     */
    async endorseRequirement(input: {
        requirementId: string
        comments?: string
    }): Promise<void> {
        this._permissionInteractor.assertOrganizationContributor(this._organizationId)

        const currentUserPerson = await this.getCurrentUserPerson(),
            personId = currentUserPerson.id

        await this.validateUserCanEndorseForPerson({ personId, requirementId: input.requirementId })
        await this.validateEndorsementEligibility({ requirementId: input.requirementId, personId })

        const requirement = await this._requirementRepository.getById(input.requirementId),
            currentUserId = this._permissionInteractor.userId
        await this._endorsementRepository.updateEndorsement({
            requirementId: input.requirementId,
            reqType: requirement.reqType,
            actorId: personId,
            category: EndorsementCategory.ROLE_BASED,
            status: EndorsementStatus.APPROVED,
            endorsedByActorId: personId,
            comments: input.comments,
            modifiedById: currentUserId,
            modifiedDate: new Date()
        })

        await this.checkAndAutoTransitionRequirement(input.requirementId)
    }

    /**
     * Reject a requirement endorsement with mandatory reason
     * @param input - The rejection input parameters
     * @param input.requirementId - The requirement ID
     * @param input.reason - The reason for rejection
     * @throws {PermissionDeniedException} If the user is not a contributor of the organization
     * @throws {MismatchException} If user cannot endorse (no Person entity found or no endorsement permissions)
     * @throws {InvalidWorkflowStateException} If requirement is not in Review state or endorsement already processed
     */
    async rejectEndorsement(input: {
        requirementId: string
        reason: string
    }): Promise<void> {
        this._permissionInteractor.assertOrganizationContributor(this._organizationId)

        const personId = await this.getCurrentUserPerson().then(p => p.id)

        await this.validateUserCanEndorseForPerson({ personId, requirementId: input.requirementId })
        await this.validateEndorsementEligibility({ requirementId: input.requirementId, personId })

        const requirement = await this._requirementRepository.getById(input.requirementId),
            currentUserId = this._permissionInteractor.userId
        await this._endorsementRepository.updateEndorsement({
            requirementId: input.requirementId,
            reqType: requirement.reqType,
            actorId: personId,
            category: EndorsementCategory.ROLE_BASED,
            status: EndorsementStatus.REJECTED,
            endorsedByActorId: personId,
            comments: input.reason,
            modifiedById: currentUserId,
            modifiedDate: new Date()
        })

        await this.checkAndAutoTransitionRequirement(input.requirementId)
    }

    /**
     * Validate that all mandatory endorsements are complete and no rejections exist
     * @param requirementId - The requirement ID
     * @throws {PermissionDeniedException} If the user is not a reader of the organization
     * @throws {InvalidWorkflowStateException} If any mandatory endorsements are still pending or if any endorsements were rejected
     */
    async validateAllEndorsementsComplete(requirementId: string): Promise<void> {
        this._permissionInteractor.assertOrganizationReader(this._organizationId)

        const endorsements = await this._endorsementRepository.findByRequirementInReview(requirementId),
            pendingMandatory = []

        for (const endorsement of endorsements) {
            if (endorsement.status === EndorsementStatus.PENDING) {
                // Fetch full person data to check if they have mandatory role capabilities
                const fullPerson = await this._requirementRepository.getById(endorsement.endorsedBy.id) as req.PersonType

                if (fullPerson.isProductOwner || fullPerson.isImplementationOwner)
                    pendingMandatory.push(endorsement)
            }
        }

        if (pendingMandatory.length > 0)
            throw new InvalidWorkflowStateException('All mandatory endorsements must be complete before approval')

        const rejections = endorsements.filter(e => e.status === EndorsementStatus.REJECTED)
        if (rejections.length > 0)
            throw new InvalidWorkflowStateException('Cannot approve requirement with rejected endorsements')
    }

    /**
     * Validates that all review checklist items are complete before allowing workflow transitions
     * This ensures business logic is enforced even when endpoints are called directly
     * @param requirementId - The requirement ID to validate
     * @throws {PermissionDeniedException} If the user is not a reader of the organization
     * @throws {InvalidWorkflowStateException} If review checklist is not complete
     */
    async validateReviewChecklistComplete(requirementId: string): Promise<void> {
        this._permissionInteractor.assertOrganizationReader(this._organizationId)

        // Get all endorsements for this requirement version
        const endorsements = await this._endorsementRepository.findByRequirementInReview(requirementId),
            // Check that all endorsements are complete (either endorsed or rejected, no pending)
            pendingEndorsements = endorsements.filter(e => e.status === EndorsementStatus.PENDING)

        if (pendingEndorsements.length > 0) {
            throw new InvalidWorkflowStateException(
                `All review checklist items must be completed before workflow transition. `
                + `${pendingEndorsements.length} endorsement(s) are still pending.`
            )
        }
    }

    /**
     * Create mandatory endorsements for Product Owner and Implementation Owner persons
     * @param requirementId - The requirement ID
     * @throws {PermissionDeniedException} If the user is not a contributor of the organization
     * @throws {MismatchException} If the solution does not have designated Product Owner and Implementation Owner persons
     */
    async createMandatoryEndorsements(requirementId: string): Promise<void> {
        this._permissionInteractor.assertOrganizationContributor(this._organizationId)

        // Get the requirement to determine its category
        const requirement = await this._requirementRepository.getById(requirementId),
            // Find all active persons in the solution
            persons = await this._requirementRepository.getAllLatest({
                solutionId: this._solutionId,
                reqType: ReqType.PERSON,
                workflowState: WorkflowState.Active
            }) as req.PersonType[],
            // Get the requirement's prefix first character dynamically from the domain
            ReqTypePascal = snakeCaseToPascalCase(requirement.reqType) as keyof typeof req,
            RequirementSchema = req[ReqTypePascal],
            innerSchema = RequirementSchema instanceof z.ZodEffects
                ? RequirementSchema.innerType()
                : RequirementSchema,
            shape = (innerSchema as z.ZodObject<z.ZodRawShape>).shape,
            reqIdPrefix = shape?.reqIdPrefix?._def?.defaultValue(),
            reqPrefixChar = reqIdPrefix?.charAt(0),
            // Find persons who can endorse this requirement type
            eligiblePersons = persons.filter((person) => {
                // Product Owner and Implementation Owner can endorse all requirement types
                if (person.isProductOwner || person.isImplementationOwner)
                    return true

                // Check specific endorsement capability based on requirement's prefix
                switch (reqPrefixChar) {
                    case 'P': // Project requirements
                        return person.canEndorseProjectRequirements || false
                    case 'E': // Environment requirements
                        return person.canEndorseEnvironmentRequirements || false
                    case 'G': // Goals requirements
                        return person.canEndorseGoalsRequirements || false
                    case 'S': // System requirements
                        return person.canEndorseSystemRequirements || false
                    default:
                        return false
                }
            })

        if (eligiblePersons.length === 0)
            throw new MismatchException(`No persons found with endorsement capabilities for ${requirement.reqType} requirements (prefix: ${reqPrefixChar})`)

        // Create role-based endorsements for each eligible person
        for (const person of eligiblePersons) {
            await this._endorsementRepository.create({
                requirementId,
                reqType: requirement.reqType,
                endorsedBy: person.id,
                category: EndorsementCategory.ROLE_BASED,
                status: EndorsementStatus.PENDING,
                comments: undefined
            })
        }
        // TODO: Future implementation for automated endorsements
        /*
        // Create automated checklist endorsements
        // These will be handled by system processes (future implementation)
        const automatedCategories = [
                EndorsementCategory.CORRECTNESS,
                EndorsementCategory.JUSTIFIABILITY,
                EndorsementCategory.COMPLETENESS,
                EndorsementCategory.CONSISTENCY,
                EndorsementCategory.NON_AMBIGUITY,
                EndorsementCategory.FEASIBILITY,
                EndorsementCategory.ABSTRACTNESS,
                EndorsementCategory.TRACEABILITY,
                EndorsementCategory.DELIMITEDNESS,
                EndorsementCategory.READABILITY,
                EndorsementCategory.MODIFIABILITY,
                EndorsementCategory.VERIFIABILITY,
                EndorsementCategory.PRIORITIZATION
            ],
            // Get a system actor for automated endorsements
            systemActorId = await this.getSystemActor()

        for (const category of automatedCategories) {
            await this._endorsementRepository.create({
                requirementId,
                endorsedBy: systemActorId,
                category,
                status: EndorsementStatus.PENDING, // Will be updated by automated processes
                comments: undefined
            })
        }
        */
    }

    /**
     * Get human-readable title for endorsement categories
     */
    private getEndorsementCategoryTitle(category: EndorsementCategory): string {
        // Special cases for specific formatting
        if (category === EndorsementCategory.ROLE_BASED)
            return 'Role-Based Endorsement'

        if (category === EndorsementCategory.NON_AMBIGUITY)
            return 'Non-Ambiguity'

        // Convert SCREAMING_SNAKE_CASE to Title Case using utility function
        return snakeCaseToTitleCase(category.toLowerCase())
    }

    /**
     * Compute overall review status from individual review items
     */
    private computeOverallReviewStatus(items: Array<{ status: ReviewStatus }>): ReviewStatus {
        if (items.length === 0) return ReviewStatus.NONE

        const approved = items.filter(item => item.status === ReviewStatus.APPROVED),
            rejected = items.filter(item => item.status === ReviewStatus.REJECTED)

        // If any items are rejected, overall is rejected
        if (rejected.length > 0) return ReviewStatus.REJECTED

        // If all items are approved, overall is approved
        if (approved.length === items.length) return ReviewStatus.APPROVED

        // If some items are approved, overall is partial
        if (approved.length > 0) return ReviewStatus.PARTIAL

        // Otherwise, overall is pending
        return ReviewStatus.PENDING
    } /**
     * Get the current user's Person entity within the solution
     * @returns The Person entity linked to the current user
     * @throws {MismatchException} If no Person entity is found for the current user
     */

    private async getCurrentUserPerson(): Promise<req.PersonType> {
        const currentUserId = this._permissionInteractor.userId,
            // Query for Person entities with the current user's appUserId
            persons = await this._requirementRepository.getAll({
                solutionId: this._solutionId,
                reqType: ReqType.PERSON,
                query: { appUserId: currentUserId }
            }) as req.PersonType[]

        if (persons.length === 0)
            throw new NotFoundException(`Person with id ${currentUserId} not found`)

        // Return the first matching person (enrichment not needed here)
        return persons[0]!
    }

    /**
     * Validate that the current user can endorse through the specified person entity for the specific requirement
     * @param params - The parameters for validation
     * @param params.personId - The person ID
     * @param params.requirementId - The requirement ID to check endorsement capability for
     * @throws {MismatchException} If user cannot endorse through the specified person
     */
    private async validateUserCanEndorseForPerson({ personId, requirementId }: { personId: string, requirementId: string }): Promise<void> {
        const currentUserId = this._permissionInteractor.userId,
            person = await this._requirementRepository.getById(personId) as req.PersonType,
            requirement = await this._requirementRepository.getById(requirementId),
            // Check if the current user is linked to this person entity
            userIsLinkedToPerson = person.appUser?.id === currentUserId

        if (!userIsLinkedToPerson)
            throw new MismatchException('User is not linked to this endorsement person')

        // Product Owner and Implementation Owner can endorse all requirement types
        if (person.isProductOwner || person.isImplementationOwner)
            return

        // Check specific endorsement capability based on requirement's reqId prefix
        const reqIdPrefix = requirement.reqId?.charAt(0)
        let canEndorseThisCategory = false

        switch (reqIdPrefix) {
            case 'P': // Project requirements
                canEndorseThisCategory = person.canEndorseProjectRequirements || false
                break
            case 'E': // Environment requirements
                canEndorseThisCategory = person.canEndorseEnvironmentRequirements || false
                break
            case 'G': // Goals requirements
                canEndorseThisCategory = person.canEndorseGoalsRequirements || false
                break
            case 'S': // System requirements
                canEndorseThisCategory = person.canEndorseSystemRequirements || false
                break
            default:
                throw new MismatchException(`Unknown requirement category for reqId: ${requirement.reqId}`)
        }

        if (!canEndorseThisCategory)
            throw new MismatchException(`This person does not have permission to endorse ${reqIdPrefix} category requirements`)
    }

    /**
     * Validate that an endorsement is eligible for processing
     * @param params - The parameters for validation
     * @param params.requirementId - The requirement ID
     * @param params.personId - The person ID
     * @throws {InvalidWorkflowStateException} If requirement is not in Review state or endorsement already processed
     * @throws {MismatchException} If no endorsement request exists for the person
     */
    private async validateEndorsementEligibility({ requirementId, personId }: { requirementId: string, personId: string }): Promise<void> {
        // Verify requirement is in Review state
        const requirement = await this._requirementRepository.getById(requirementId)
        if (requirement.workflowState !== WorkflowState.Review)
            throw new InvalidWorkflowStateException(`Requirement with id ${requirementId} is not in the Review state`)

        // Verify endorsement exists and is pending
        const endorsement = await this._endorsementRepository.findByRequirementInReviewActorAndCategory({
            requirementId,
            actorId: personId,
            category: EndorsementCategory.ROLE_BASED // Only validate role-based endorsements for manual actions
        })
        if (!endorsement)
            throw new MismatchException(`No endorsement request exists for person ${personId}`)

        if (endorsement.status !== EndorsementStatus.PENDING)
            throw new InvalidWorkflowStateException(`Endorsement has already been processed`)
    }

    /**
     * Check if all review items are complete and automatically transition the requirement
     * to Active (if all approved) or Rejected (if any rejected) state
     * @param requirementId - The requirement ID to check
     * @throws {PermissionDeniedException} If the user is not a contributor of the organization
     */
    private async checkAndAutoTransitionRequirement(requirementId: string): Promise<void> {
        // Check if all endorsements are complete (no pending)
        const endorsements = await this._endorsementRepository.findByRequirementInReview(requirementId),
            pendingEndorsements = endorsements.filter(e => e.status === EndorsementStatus.PENDING)

        // If there are still pending endorsements, don't transition
        if (pendingEndorsements.length > 0)
            return

        // All endorsements are complete - check if any are rejected
        const rejectedEndorsements = endorsements.filter(e => e.status === EndorsementStatus.REJECTED)

        if (rejectedEndorsements.length > 0)
            await this.rejectRequirement(requirementId)
        else
            await this.approveRequirement(requirementId)
    }

    /**
     * Rejects a requirement currently in the Review state.
     * This will change the state to Rejected.
     * @param id - The id of the requirement to reject
     * @throws {InvalidWorkflowStateException} If the requirement is not currently in the Review state.
     * @throws {PermissionDeniedException} If the user is not a contributor of the organization
     * @throws {MismatchException} If ReqType.SILENCE or ReqType.PARSED_REQUIREMENTS is provided
     * @throws {NotFoundException} If the requirement does not exist
     */
    async rejectRequirement(
        id: req.RequirementType['id']
    ): Promise<void> {
        this._permissionInteractor.assertOrganizationContributor(this._organizationId)

        const currentRequirement = await this._requirementRepository.getById(id)

        if (currentRequirement.reqType === ReqType.PARSED_REQUIREMENTS)
            throw new MismatchException('ReqType.PARSED_REQUIREMENTS is not allowed.')

        if (currentRequirement.reqType === ReqType.SILENCE)
            throw new MismatchException('Silence requirements cannot be rejected. They can only be removed.')

        if (currentRequirement.workflowState !== WorkflowState.Review)
            throw new InvalidWorkflowStateException(`Requirement with id ${id} is not in the Review state`)

        await this.validateReviewChecklistComplete(id)

        return this._requirementRepository.update({
            reqProps: {
                id,
                reqType: currentRequirement.reqType,
                workflowState: WorkflowState.Rejected
            },
            modifiedById: this._permissionInteractor.userId,
            modifiedDate: new Date()
        })
    }

    /**
     * Approves a requirement currently in the Review state.
     * This will change the state to Active.
     * @param id - The id of the requirement to approve
     * @throws {InvalidWorkflowStateException} If the requirement is not currently in the Review state or if referenced requirements are not Active.
     * @throws {PermissionDeniedException} If the user is not a contributor of the organization or better
     * @throws {MismatchException} If ReqType.SILENCE or ReqType.PARSED_REQUIREMENTS is provided
     * @throws {NotFoundException} If the requirement does not exist
     */
    async approveRequirement(
        id: req.RequirementType['id']
    ): Promise<void> {
        this._permissionInteractor.assertOrganizationContributor(this._organizationId)

        const currentRequirement = await this._requirementRepository.getById(id)

        if (currentRequirement.reqType === ReqType.PARSED_REQUIREMENTS)
            throw new MismatchException(`Requirement with id ${id} is of type PARSED_REQUIREMENTS and cannot be approved`)

        if (currentRequirement.reqType === ReqType.SILENCE)
            throw new MismatchException(`Silence requirements cannot be approved.`)

        if (currentRequirement.workflowState !== WorkflowState.Review)
            throw new InvalidWorkflowStateException(`Requirement with id ${id} is not in the Review state`)

        await this.validateAllEndorsementsComplete(id)

        await this.validateReviewChecklistComplete(id)

        await this.assertReferencedRequirementsAreActive(currentRequirement)

        return this._requirementRepository.update({
            reqProps: {
                id,
                reqType: currentRequirement.reqType,
                workflowState: WorkflowState.Active
            },
            modifiedById: this._permissionInteractor.userId,
            modifiedDate: new Date()
        })
    }

    /**
     * Asserts that all referenced requirements are in the Active workflow state.
     * This is used during approval to ensure that a requirement can only reference Active requirements.
     * @param reqProps The properties of the requirements to check
     * @throws {InvalidWorkflowStateException} If a referenced requirement is not in the Active state
     */
    private async assertReferencedRequirementsAreActive(
        reqProps: Partial<Omit<req.RequirementType, 'reqId' | keyof AuditMetadataType>>
    ) {
        const ownId = reqProps.id // Get the requirement's own ID to exclude it

        for (const [key, value] of Object.entries(reqProps)) {
            if (key === 'solution') continue
            if (key === 'id') continue // Skip the requirement's own ID

            // Handle arrays of references
            if (Array.isArray(value)) {
                for (const item of value) {
                    const id = typeof item === 'string' && validateUuid(item)
                        ? item
                        : typeof item === 'object' && item && 'id' in item ? (item as { id: string }).id : undefined

                    if (!id) continue
                    if (id === ownId) continue // Skip self-references

                    // Skip app_user references and other non-requirement entities
                    if (typeof item === 'object' && item && 'entityType' in item)
                        continue

                    try {
                        const result = await this._requirementRepository.getById(id)

                        if (result.workflowState !== WorkflowState.Active) {
                            throw new InvalidWorkflowStateException(
                                `Cannot approve requirement because referenced requirement '${result.name}' (${key}) is in ${result.workflowState} state instead of Active. All referenced requirements must be Active before this requirement can be approved.`
                            )
                        }
                    } catch (error) {
                        if (error instanceof InvalidWorkflowStateException)
                            throw error

                        throw new MismatchException(`Referenced requirement with id ${id} not found`)
                    }
                }
            } else {
                const id = typeof value === 'string' && validateUuid(value)
                    ? value
                    : typeof value === 'object' && value && 'id' in value ? (value as { id: string }).id : undefined

                if (!id) continue
                if (id === ownId) continue // Skip self-references

                // Skip app_user references and other non-requirement entities
                if (typeof value === 'object' && value && 'entityType' in value)
                    continue

                try {
                    const result = await this._requirementRepository.getById(id)

                    if (result.workflowState !== WorkflowState.Active) {
                        throw new InvalidWorkflowStateException(
                            `Cannot approve requirement because referenced requirement '${result.name}' (${key}) is in ${result.workflowState} state instead of Active. All referenced requirements must be Active before this requirement can be approved.`
                        )
                    }
                } catch (error) {
                    if (error instanceof InvalidWorkflowStateException)
                        throw error

                    throw new MismatchException(`Referenced requirement with id ${id} not found`)
                }
            }
        }
    }
}
