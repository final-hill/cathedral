import type { z } from 'zod'
import { validate as validateUuid } from 'uuid'
import { Interactor } from './Interactor'
import type { ReviewInteractor } from './ReviewInteractor'
import type * as req from '#shared/domain/requirements'
import { ReqType, WorkflowState, InvalidWorkflowStateException, MismatchException } from '#shared/domain'
import type { AuditMetadata, AuditMetadataType } from '#shared/domain'
import type { RequirementReferenceType } from '#shared/domain/requirements/EntityReferences'
import { MINIMUM_REQUIREMENT_TYPES } from '#shared/domain/requirements/minimumRequirements'
import { SINGLETON_REQUIREMENT_TYPES } from '#shared/domain/requirements/singletonRequirements'
import type { PermissionInteractor, AppUserInteractor } from '.'
import type { RequirementRepository } from '~~/server/data/repositories/RequirementRepository'
import type { NaturalLanguageToRequirementService } from '~~/server/data/services/NaturalLanguageToRequirementService'
import type { AppUserReferenceType } from '~~/shared/domain/application/EntityReferences'

type ReqTypeName = keyof typeof req

export class RequirementInteractor extends Interactor<req.RequirementType, RequirementRepository> {
    private readonly permissionInteractor: PermissionInteractor
    private readonly appUserInteractor: AppUserInteractor
    private readonly reviewInteractor: ReviewInteractor
    private readonly solutionId: string
    private readonly organizationId: string

    /**
     * Create a new RequirementInteractor
     *
     * @param props.repository - The repository to use
     * @param props.permissionInteractor - The PermissionInteractor instance
     * @param props.appUserInteractor - The AppUserInteractor instance
     * @param props.reviewInteractor - The ReviewInteractor instance
     */
    constructor(props: {
        repository: RequirementRepository
        permissionInteractor: PermissionInteractor
        appUserInteractor: AppUserInteractor
        reviewInteractor: ReviewInteractor
        solutionId: string
        organizationId: string
    }) {
        super(props)
        this.organizationId = props.organizationId
        this.solutionId = props.solutionId
        this.permissionInteractor = props.permissionInteractor
        this.appUserInteractor = props.appUserInteractor
        this.reviewInteractor = props.reviewInteractor

        // TODO: Implement, or update to only rely on the solutionId as a dependency
        // this._assertSolutionBelongsToOrganization();
    }

    /**
     * Enrich requirement data with user information
     * @param requirement - The requirement to enrich
     * @returns The requirement with enriched user data
     */
    private async enrichUserData<T extends req.RequirementType>(requirement: T): Promise<T> {
        try {
            const enrichedRequirement = { ...requirement }

            if (requirement.createdBy?.id) {
                try {
                    const createdByUser = await this.appUserInteractor.getUserById({
                        id: requirement.createdBy.id,
                        organizationId: this.organizationId
                    })
                    enrichedRequirement.createdBy = {
                        id: createdByUser.id,
                        name: createdByUser.name,
                        entityType: 'app_user' as const
                    }
                } catch {
                    // Keep the existing data if user lookup fails
                }
            }

            if (requirement.modifiedBy?.id) {
                try {
                    const modifiedByUser = await this.appUserInteractor.getUserById({
                        id: requirement.modifiedBy.id,
                        organizationId: this.organizationId
                    })
                    enrichedRequirement.modifiedBy = {
                        id: modifiedByUser.id,
                        name: modifiedByUser.name,
                        entityType: 'app_user' as const
                    }
                } catch {
                    // Keep the existing data if user lookup fails
                }
            }

            // Enrich the appUser field
            if ('appUser' in requirement && requirement.appUser) {
                const req = requirement as T & { appUser?: AppUserReferenceType }
                if (req.appUser?.id) {
                    try {
                        const appUser = await this.appUserInteractor.getUserById({
                                id: req.appUser.id,
                                organizationId: this.organizationId
                            }),
                            enrichedPerson = enrichedRequirement as T & { appUser?: AppUserReferenceType }
                        enrichedPerson.appUser = {
                            id: appUser.id,
                            name: appUser.name,
                            entityType: 'app_user' as const
                        }
                    } catch {
                        // Keep the existing data if user lookup fails
                    }
                }
            }

            return enrichedRequirement
        } catch {
            return requirement
        }
    }

    /**
     * Assert that all requirement references (uuid properties) belong to the same solution.
     * This is to prevent a requirement from another solution being added to the current solution.
     * This is a security measure to prevent unauthorized access to requirements
     * @param reqProps The properties of the requirements to check
     * @throws {MismatchException} If a referenced requirement does not belong to the solution
     */
    private async assertReferencedRequirementsBelongToSolution(
        reqProps: Partial<Omit<req.RequirementType, 'reqId' | keyof typeof AuditMetadata>>
    ) {
        for (const [key, value] of Object.entries(reqProps)) {
            if (key === 'organization') continue

            if (Array.isArray(value)) {
                for (const item of value) {
                    const id = typeof item === 'string' && validateUuid(item)
                        ? item
                        : typeof item === 'object' && item && 'id' in item ? (item as { id: string }).id : undefined

                    if (!id) continue

                    await this.validateReferenceScope({ id, key, reqProps })
                }
            } else {
                const id = typeof value === 'string' && validateUuid(value)
                    ? value
                    : typeof value === 'object' && value && 'id' in value ? (value as { id: string }).id : undefined

                if (!id) continue

                await this.validateReferenceScope({ id, key, reqProps })
            }
        }
    }

    /**
     * Validate that a referenced entity belongs to the appropriate scope.
     * For requirements: must belong to the current solution.
     * For AppUsers: must be a member of the current organization.
     * @param params - The parameters for validation
     * @param params.id - The ID of the referenced entity
     * @param params.key - The property name containing the reference
     * @param params.reqProps - The original requirement properties for context
     * @throws {MismatchException} If the referenced entity does not belong to the appropriate scope
     */
    private async validateReferenceScope({ id, key, reqProps }: {
        id: string
        key: string
        reqProps: Partial<Omit<req.RequirementType, 'reqId' | keyof typeof AuditMetadata>>
    }) {
        // Check if this is an AppUser reference (Ex: From the Person entity)
        if (key === 'appUser') {
            // For AppUser references, validate they belong to the organization
            try {
                await this.permissionInteractor.getAppUserOrganizationRole({
                    appUserId: id,
                    organizationId: this.organizationId
                })
                // If we get here, the user is a member of the organization
                return
            } catch {
                throw new MismatchException(`Referenced AppUser with id ${id} is not a member of the organization`)
            }
        }

        // For requirement references, validate they belong to the solution
        try {
            const result = await this.repository.getById(id)

            // For solution references, ensure it matches the current solution
            if (key === 'solution') {
                if (result.id !== this.solutionId)
                    throw new MismatchException(`Requirement with id ${reqProps['id']} references solution ${result.id} but should reference current solution ${this.solutionId}`)
            } else {
                // For all other requirement references, ensure they belong to the current solution
                // Skip if the referenced item doesn't have a solution property (e.g., organization-level entities)
                if ('solution' in result && result.solution && typeof result.solution === 'object' && 'id' in result.solution) {
                    if ((result.solution as { id: string }).id !== this.solutionId)
                        throw new MismatchException(`Referenced requirement with id ${id} belongs to solution ${(result.solution as { id: string }).id} but should belong to current solution ${this.solutionId}`)
                }
            }
        } catch (error) {
            if (error instanceof MismatchException)
                throw error

            throw new MismatchException(`Referenced requirement with id ${id} does not belong to the solution`)
        }
    }

    /**
     * Get a requirement by its id.
     * @throws {PermissionDeniedException} If the user is not a reader of the organization or better
     * @throws {NotFoundException} If the requirement does not exist
     * @throws {MismatchException} If the requirement is not of the given type
     * @param id - The id of the requirement to get
     * @returns The requirement with the given id
     */
    async getRequirementTypeById<R extends req.RequirementType>({ id, reqType }: { id: R['id'], reqType: ReqType }): Promise<R> {
        this.permissionInteractor.assertOrganizationReader(this.organizationId)

        const result = await this.repository.getById(id)

        if (result.reqType !== reqType) throw new MismatchException(`Requirement with id ${id} is not of type ${reqType}`)

        const enrichedResult = await this.enrichUserData(result)

        return enrichedResult as R
    }

    /**
     * Get the current active requirements of a given type.
     * @param reqType - The type of the requirements to get
     * @returns The current active requirements of the given type
     * @throws {PermissionDeniedException} If the user is not a reader of the organization or better
     */
    async getCurrentActiveRequirementsByType<R extends ReqTypeName>(reqType: ReqType): Promise<z.infer<typeof req[R]>[]> {
        this.permissionInteractor.assertOrganizationReader(this.organizationId)

        return this.repository.getAllActive({
            solutionId: this.solutionId,
            reqType: reqType as ReqType
        })
    }

    /**
     * Get all requirements in a given state.
     * @param props.workflowState - The state of the requirements to get
     * @param props.reqType - The type of the requirements to get
     * @returns The requirements in the given state
     * @throws {PermissionDeniedException} If the user is not a reader of the organization or better
     * @returns The requirements in the given state
     */
    async getLatestRequirementsByType<R extends ReqTypeName>(props: {
        workflowState: WorkflowState
        reqType: ReqType
    }): Promise<z.infer<typeof req[R]>[]> {
        this.permissionInteractor.assertOrganizationReader(this.organizationId)

        return this.repository.getAllLatest({
            solutionId: this.solutionId,
            reqType: props.reqType,
            workflowState: props.workflowState
        })
    }

    /**
     * Get all requirements of a given type across all workflow states.
     * @param reqType - The type of the requirements to get
     * @param query - The optional query to use to filter the requirements
     * @returns The requirements of the given type across all workflow states
     * @throws {PermissionDeniedException} If the user is not a reader of the organization or better
     */
    async getAllRequirementsByType<R extends ReqTypeName>(props: { reqType: ReqType, query?: Partial<z.infer<typeof req[R]>> }): Promise<z.infer<typeof req[R]>[]> {
        this.permissionInteractor.assertOrganizationReader(this.organizationId)

        return this.repository.getAll({
            solutionId: this.solutionId,
            ...props
        })
    }

    /**
     * Get all visible requirements of a given type for autocomplete purposes.
     * This includes requirements in Active, Proposed, and Review states (but not Rejected, Removed, or Parsed).
     * @param reqType - The type of the requirements to get
     * @returns The requirements of the given type across visible workflow states
     * @throws {PermissionDeniedException} If the user is not a reader of the organization or better
     */
    // FIXME: This implementation is suspicious
    async getAllVisibleRequirementsByType<R extends ReqTypeName>(reqType: ReqType): Promise<z.infer<typeof req[R]>[]> {
        this.permissionInteractor.assertOrganizationReader(this.organizationId)

        // Get requirements from all visible states
        const visibleStates = [WorkflowState.Active, WorkflowState.Proposed, WorkflowState.Review],
            allRequirements = await Promise.all(
                visibleStates.map(workflowState =>
                    this.repository.getAllLatest({
                        solutionId: this.solutionId,
                        reqType,
                        workflowState
                    })
                )
            ),
            // Flatten and return unique requirements (deduplicate by id, prioritizing most advanced workflow state)
            flatRequirements = allRequirements.flat(),
            // Create workflow state priority map (higher number = more advanced state)
            workflowPriority = new Map([
                [WorkflowState.Proposed, 1],
                [WorkflowState.Review, 2],
                [WorkflowState.Active, 3]
            ]),

            // eslint-disable-next-line max-params
            uniqueRequirements = flatRequirements.reduce((acc, req) => {
                const existingIndex = acc.findIndex(existing => existing.id === req.id)
                if (existingIndex === -1) {
                // New requirement, add it
                    acc.push(req)
                } else {
                // Duplicate ID found, keep the one with higher workflow priority
                    const existing = acc[existingIndex]!, // Safe because findIndex returned a valid index
                        reqPriority = workflowPriority.get(req.workflowState as WorkflowState) || 0,
                        existingPriority = workflowPriority.get(existing.workflowState as WorkflowState) || 0

                    if (reqPriority > existingPriority) {
                    // Replace with higher priority workflow state
                        acc[existingIndex] = req
                    }
                }
                return acc
            }, [] as typeof flatRequirements)

        return uniqueRequirements as z.infer<typeof req[R]>[]
    }

    /**
     * Get all visible requirements by type as domain references
     * @param reqType - The requirement type to filter by
     * @returns Array of domain references for the requirements
     * @throws {PermissionDeniedException} If the user is not an organization reader or better
     */
    async getVisibleRequirementReferences(reqType: ReqType): Promise<RequirementReferenceType[]> {
        // Get filtered requirements using existing business logic
        const requirements = await this.getAllVisibleRequirementsByType(reqType)

        // Convert full domain objects to references (extract just the reference fields)
        return requirements.map(req => ({
            id: req.id,
            name: req.name,
            reqType: req.reqType,
            workflowState: req.workflowState,
            lastModified: req.lastModified,
            reqIdPrefix: req.reqIdPrefix,
            uiBasePathTemplate: req.uiBasePathTemplate
        }))
    }

    /**
     * Parse a natural language statement into requirements.
     * @param props.service - The LLM service to use for parsing
     * @param props.statement - The natural language statement to parse
     * @throws {PermissionDeniedException} If the user is not a contributor of the organization or better
     * @throws {MismatchException} If no requirements are found in the statement
     * @returns The statistics of the parsed requirements with the id of the newly parsed requirements collection
     */
    async parseRequirements(props: {
        service: NaturalLanguageToRequirementService
        name: string
        statement: string
    }): Promise<req.ParsedRequirementsType['id']> {
        this.permissionInteractor.assertOrganizationContributor(this.organizationId)

        const currentUserId = this.permissionInteractor.userId,
            results = await props.service.parse(props.statement)

        if (!results || results.length === 0) throw new MismatchException('No requirements found in the statement')

        const newId = await this.repository.addParsedRequirements({
            createdById: currentUserId,
            creationDate: new Date(),
            solutionId: this.solutionId,
            name: props.name,
            statement: props.statement,
            reqData: results
        })

        return newId
    }

    /**
     * Creates a new requirement in the Proposed state.
     * @param props - The properties of the requirement to create
     * @returns The id of the created requirement
     * @throws {PermissionDeniedException} If the user is not a contributor of the organization or better
     * @throws {MismatchException} If a referenced requirement does not belong to the solution
     */
    async proposeRequirement<R extends ReqTypeName>(
        props: Omit<z.infer<typeof req[R]>, 'reqId' | 'reqIdPrefix' | 'id' | 'workflowState' | 'solution' | keyof AuditMetadataType>
    ): Promise<req.RequirementType['id']> {
        this.permissionInteractor.assertOrganizationContributor(this.organizationId)
        await this.assertReferencedRequirementsBelongToSolution(props)

        // Check singleton constraint: only one static model (requirement ID) allowed for singleton requirement types
        // This prevents creating multiple parallel versions that could both become Active
        if (SINGLETON_REQUIREMENT_TYPES.includes(props.reqType)) {
            // Check for ANY existing requirement (across all workflow states except Removed)
            // We check all states because a requirement in Proposed or Review could eventually become Active
            const existingRequirements = await this.repository.getAll({
                    solutionId: this.solutionId,
                    reqType: props.reqType
                }),

                // Filter out Removed requirements - they no longer count toward the singleton constraint
                nonRemovedRequirements = existingRequirements.filter(req => req.workflowState !== WorkflowState.Removed)

            if (nonRemovedRequirements.length > 0) {
                const existingReq = nonRemovedRequirements[0]!
                throw new InvalidWorkflowStateException(
                    `Cannot create a new ${props.reqType} requirement because one already exists (current state: ${existingReq.workflowState}). `
                    + `Singleton requirement types can only have one instance at a time. `
                    + `Please edit or revise the existing requirement (ID: ${existingReq.id}) instead.`
                )
            }
        }

        const currentUserId = this.permissionInteractor.userId

        let workflowState: WorkflowState
        if (props.reqType === ReqType.SILENCE)
            workflowState = WorkflowState.Rejected
        else if (props.reqType === ReqType.PARSED_REQUIREMENTS)
            workflowState = WorkflowState.Parsed
        else
            workflowState = WorkflowState.Proposed

        return this.repository.add({
            reqProps: {
                ...props,
                solution: { id: this.solutionId, name: '', reqType: ReqType.SOLUTION },
                workflowState
            },
            createdById: currentUserId,
            creationDate: new Date()
        })
    }

    /**
     * Updates a requirement currently in the Proposed state.
     * @param reqProps - The properties of the requirement to update
     * @throws {InvalidWorkflowStateException} If the requirement is not currently in the Proposed state.
     * @throws {PermissionDeniedException} If the user is not a contributor of the organization or better
     * @throws {NotFoundException} If the requirement does not exist
     * @throws {MismatchException} If a referenced requirement does not belong to the solution
     * @throws {MismatchException} If ReqType.PARSED_REQUIREMENTS is provided
     */
    async updateProposedRequirement<R extends ReqTypeName>(
        reqProps: Partial<Omit<z.infer<typeof req[R]>, 'reqIdPrefix' | 'workflowState' | 'solution' | keyof AuditMetadataType>> & { id: req.RequirementType['id'] }
    ) {
        this.permissionInteractor.assertOrganizationContributor(this.organizationId)
        await this.assertReferencedRequirementsBelongToSolution(reqProps)

        const currentRequirement = await this.repository.getById(reqProps.id),
            currentUserId = this.permissionInteractor.userId

        if (currentRequirement.reqType === ReqType.PARSED_REQUIREMENTS)
            throw new MismatchException('ReqType.PARSED_REQUIREMENTS is not allowed.')

        if (currentRequirement.workflowState !== WorkflowState.Proposed)
            throw new InvalidWorkflowStateException(`Requirement with id ${reqProps.id} is not in the Proposed state`)

        return this.repository.update({
            reqProps: {
                ...reqProps,
                reqType: currentRequirement.reqType,
                solution: currentRequirement.solution,
                workflowState: currentRequirement.workflowState
            },
            modifiedById: currentUserId,
            modifiedDate: new Date()
        })
    }

    /**
     * Removes a requirement currently in the Proposed state.
     * This will change the state to Removed.
     * @param id - The id of the requirement to remove
     * @throws {InvalidWorkflowStateException} If the requirement is not currently in the Proposed state.
     * @throws {MismatchException} If ReqType.PARSED_REQUIREMENTS is provided
     * @throws {PermissionDeniedException} If the user is not a contributor of the organization or better
     * @throws {NotFoundException} If the requirement does not exist
     */
    async removeProposedRequirement(
        id: req.RequirementType['id']
    ): Promise<void> {
        this.permissionInteractor.assertOrganizationContributor(this.organizationId)

        const currentRequirement = await this.repository.getById(id)

        if (currentRequirement.reqType === ReqType.PARSED_REQUIREMENTS)
            throw new MismatchException('ReqType.PARSED_REQUIREMENTS is not allowed.')

        if (currentRequirement.reqType === ReqType.PERSON)
            await this.validatePersonProtection(id)

        if (currentRequirement.workflowState !== WorkflowState.Proposed)
            throw new InvalidWorkflowStateException(`Requirement with id ${id} is not in the Proposed state`)

        return this.repository.update({
            reqProps: {
                id,
                reqType: currentRequirement.reqType,
                workflowState: WorkflowState.Removed
            },
            modifiedById: this.permissionInteractor.userId,
            modifiedDate: new Date()
        })
    }

    /**
     * Submits a requirement for review.
     * This will change the state to Review.
     * @param id - The id of the requirement to submit
     * @throws {InvalidWorkflowStateException} If the requirement is not currently in the Proposed state.
     * @throws {PermissionDeniedException} If the user is not a contributor of the organization or better
     * @throws {NotFoundException} If the requirement does not exist
     */
    async reviewRequirement(
        id: req.RequirementType['id']
    ): Promise<void> {
        this.permissionInteractor.assertOrganizationContributor(this.organizationId)

        const currentRequirement = await this.repository.getById(id)

        if (currentRequirement.reqType === ReqType.PARSED_REQUIREMENTS)
            throw new MismatchException('ReqType.PARSED_REQUIREMENTS is not allowed.')

        if (currentRequirement.reqType === ReqType.SILENCE)
            throw new MismatchException('Silence requirements cannot be submitted for review.')

        if (currentRequirement.workflowState !== WorkflowState.Proposed)
            throw new InvalidWorkflowStateException(`Requirement with id ${id} is not in the Proposed state`)

        await this.repository.update({
            reqProps: {
                id,
                reqType: currentRequirement.reqType,
                workflowState: WorkflowState.Review
            },
            modifiedById: this.permissionInteractor.userId,
            modifiedDate: new Date()
        })

        await this.reviewInteractor.createMandatoryEndorsements(id)
    }

    /**
     * Revises a requirement currently in the Rejected state.
     * This will change the state to Proposed.
     * @param id - The id of the requirement to revise
     * @throws {InvalidWorkflowStateException} If the requirement is not currently in the Rejected state.
     * @throws {PermissionDeniedException} If the user is not a contributor of the organization or better
     * @throws {NotFoundException} If the requirement does not exist
     * @throws {MismatchException} If ReqType.SILENCE or ReqType.PARSED_REQUIREMENTS is provided
     */
    async reviseRejectedRequirement(
        id: req.RequirementType['id']
    ): Promise<void> {
        this.permissionInteractor.assertOrganizationContributor(this.organizationId)

        const currentRequirement = await this.repository.getById(id)

        if (currentRequirement.workflowState !== WorkflowState.Rejected)
            throw new InvalidWorkflowStateException(`Requirement with id ${id} is not in the Rejected state`)

        if (currentRequirement.reqType === ReqType.SILENCE)
            throw new MismatchException(`Silence requirements cannot be revised. They can only be removed.`)

        if (currentRequirement.reqType === ReqType.PARSED_REQUIREMENTS)
            throw new MismatchException(`Parsed requirements cannot be revised.`)

        return this.repository.update({
            reqProps: {
                id,
                reqType: currentRequirement.reqType,
                workflowState: WorkflowState.Proposed
            },
            modifiedById: this.permissionInteractor.userId,
            modifiedDate: new Date()
        })
    }

    /**
     * Removes a requirement currently in the Rejected state.
     * This will change the state to Removed.
     * @param id - The id of the requirement to remove
     * @throws {InvalidWorkflowStateException} If the requirement is not currently in the Rejected state.
     * @throws {PermissionDeniedException} If the user is not a contributor of the organization or better
     * @throws {NotFoundException} If the requirement does not exist
     */
    async removeRejectedRequirement(
        id: req.RequirementType['id']
    ): Promise<void> {
        this.permissionInteractor.assertOrganizationContributor(this.organizationId)

        const currentRequirement = await this.repository.getById(id)

        if (currentRequirement.reqType === ReqType.PARSED_REQUIREMENTS)
            throw new MismatchException(`Requirement with id ${id} is of type PARSED_REQUIREMENTS and cannot be removed`)

        if (currentRequirement.reqType === ReqType.PERSON)
            await this.validatePersonProtection(id)

        if (currentRequirement.workflowState !== WorkflowState.Rejected)
            throw new InvalidWorkflowStateException(`Requirement with id ${id} is not in the Rejected state`)

        return this.repository.update({
            reqProps: {
                id,
                reqType: currentRequirement.reqType,
                workflowState: WorkflowState.Removed
            },
            modifiedById: this.permissionInteractor.userId,
            modifiedDate: new Date()
        })
    }

    /**
     * Restores a requirement currently in the Removed state.
     * This will change the state to Proposed.
     * @param id - The id of the requirement to restore
     * @throws {InvalidWorkflowStateException} If the requirement is not currently in the Removed state.
     * @throws {MismatchException} If ReqType.PARSED_REQUIREMENTS is provided
     * @throws {PermissionDeniedException} If the user is not a contributor of the organization or better
     * @throws {NotFoundException} If the requirement does not exist
     */
    async restoreRemovedRequirement(
        id: req.RequirementType['id']
    ): Promise<void> {
        this.permissionInteractor.assertOrganizationContributor(this.organizationId)

        const currentRequirement = await this.repository.getById(id)

        if (currentRequirement.workflowState !== WorkflowState.Removed)
            throw new InvalidWorkflowStateException(`Requirement with id ${id} is not in the Removed state`)

        if (currentRequirement.reqType === ReqType.PARSED_REQUIREMENTS)
            throw new MismatchException(`Requirement with id ${id} is of type PARSED_REQUIREMENTS and cannot be restored`)

        // Silence requirements cannot be restored - they remain in the Removed state permanently
        if (currentRequirement.reqType === ReqType.SILENCE)
            throw new InvalidWorkflowStateException(`Silence requirements cannot be restored once removed.`)

        // Check singleton constraint: prevent restoring if another instance exists
        if (SINGLETON_REQUIREMENT_TYPES.includes(currentRequirement.reqType)) {
            const existingRequirements = await this.repository.getAll({
                    solutionId: this.solutionId,
                    reqType: currentRequirement.reqType
                }),

                // Filter out the current requirement and other Removed requirements
                nonRemovedRequirements = existingRequirements.filter(req =>
                    req.id !== id && req.workflowState !== WorkflowState.Removed
                )

            if (nonRemovedRequirements.length > 0) {
                const existingReq = nonRemovedRequirements[0]!
                throw new InvalidWorkflowStateException(
                    `Cannot restore ${currentRequirement.reqType} requirement because another instance already exists (current state: ${existingReq.workflowState}). `
                    + `Singleton requirement types can only have one instance at a time. `
                    + `Please remove or complete the existing requirement (ID: ${existingReq.id}) first.`
                )
            }
        }

        return this.repository.update({
            reqProps: {
                id,
                reqType: currentRequirement.reqType,
                workflowState: WorkflowState.Proposed
            },
            modifiedById: this.permissionInteractor.userId,
            modifiedDate: new Date()
        })
    }

    /**
     * Revises a requirement currently in the Active state by creating a new version in Proposed state.
     * The original Active requirement remains unchanged until the new version is approved.
     *
     * @param id - The id of the requirement to revise
     * @throws {InvalidWorkflowStateException} If the requirement is not currently in the Active state
     * @throws {InvalidWorkflowStateException} If there are already newer versions in Proposed or Review states (prevents parallel conflicts)
     * @throws {PermissionDeniedException} If the user is not a contributor of the organization or better
     * @throws {MismatchException} If ReqType.PARSED_REQUIREMENTS is provided
     * @throws {NotFoundException} If the requirement does not exist
     */
    async editActiveRequirement(
        id: req.RequirementType['id']
    ): Promise<void> {
        this.permissionInteractor.assertOrganizationContributor(this.organizationId)

        const currentRequirement = await this.repository.getById(id)

        if (currentRequirement.reqType === ReqType.PARSED_REQUIREMENTS)
            throw new MismatchException('ReqType.PARSED_REQUIREMENTS is not valid for this operation.')

        if (currentRequirement.workflowState !== WorkflowState.Active)
            throw new InvalidWorkflowStateException(`Requirement with id ${id} is not in the Active state`)

        const hasNewerVersions = await this.repository.hasNewerProposedOrReviewVersions(id)
        if (hasNewerVersions) throw new InvalidWorkflowStateException(`Cannot revise active requirement ${id} because there are already newer versions in Proposed or Review states. Only one revision process can be active at a time to prevent conflicting changes.`)

        return this.repository.update({
            reqProps: {
                id,
                reqType: currentRequirement.reqType,
                workflowState: WorkflowState.Proposed
            },
            modifiedById: this.permissionInteractor.userId,
            modifiedDate: new Date()
        })
    }

    /**
     * Removes a requirement currently in the Active state.
     * This will change the state to Removed.
     * @param id - The id of the requirement to remove
     * @throws {InvalidWorkflowStateException} If the requirement is not currently in the Active state.
     * @throws {PermissionDeniedException} If the user is not a contributor of the organization or better
     * @throws {MismatchException} If ReqType.PARSED_REQUIREMENTS is provided
     * @throws {NotFoundException} If the requirement does not exist
     */
    async removeActiveRequirement(
        id: req.RequirementType['id']
    ): Promise<void> {
        this.permissionInteractor.assertOrganizationContributor(this.organizationId)

        const currentRequirement = await this.repository.getById(id)

        if (currentRequirement.reqType === ReqType.PARSED_REQUIREMENTS)
            throw new MismatchException('ReqType.PARSED_REQUIREMENTS is not allowed.')

        if (currentRequirement.reqType === ReqType.PERSON)
            await this.validatePersonProtection(id)

        // Protect singleton requirements from removal when Active
        // These are essential requirements that cannot be removed once they reach Active state
        if (SINGLETON_REQUIREMENT_TYPES.includes(currentRequirement.reqType)) {
            throw new InvalidWorkflowStateException(
                `Cannot remove Active ${currentRequirement.reqType} requirement. `
                + `Singleton requirements are essential to the solution and cannot be deleted once Active. `
                + `To make changes, use the Revise action instead.`
            )
        }

        if (currentRequirement.workflowState !== WorkflowState.Active)
            throw new InvalidWorkflowStateException(`Requirement with id ${id} is not in the Active state`)

        return this.repository.update({
            reqProps: {
                id,
                reqType: currentRequirement.reqType,
                workflowState: WorkflowState.Removed
            },
            modifiedById: this.permissionInteractor.userId,
            modifiedDate: new Date()
        })
    }

    /**
     * Check if a requirement type has any active requirements.
     * @param reqType - The requirement type to check
     * @returns True if there are active requirements of this type, false otherwise
     * @throws {PermissionDeniedException} If the user is not a reader of the organization or better
     */
    async hasActiveRequirements(reqType: ReqType): Promise<boolean> {
        this.permissionInteractor.assertOrganizationReader(this.organizationId)

        const activeRequirements = await this.repository.getAllActive({
            solutionId: this.solutionId,
            reqType
        })

        return activeRequirements.length > 0
    }

    /**
     * Get all missing minimum requirements for the current solution.
     * @returns Array of missing requirement types
     * @throws {PermissionDeniedException} If the user is not a reader of the organization or better
     */
    async getMissingMinimumRequirements(): Promise<ReqType[]> {
        this.permissionInteractor.assertOrganizationReader(this.organizationId)

        const missing: ReqType[] = []

        for (const reqType of MINIMUM_REQUIREMENT_TYPES) {
            const hasActive = await this.hasActiveRequirements(reqType)
            if (!hasActive)
                missing.push(reqType)
        }

        return missing
    }

    /**
     * Validates that mandatory persons cannot be deleted
     * @param personId - The person ID to validate
     * @throws {MismatchException} If attempting to delete a mandatory person
     */
    private async validatePersonProtection(personId: string): Promise<void> {
        const person = await this.getRequirementTypeById({ id: personId, reqType: ReqType.PERSON }) as req.PersonType

        if (person.isProductOwner)
            throw new MismatchException('Product Owner person cannot be deleted. This person is required for the solution.')

        if (person.isImplementationOwner)
            throw new MismatchException('Implementation Owner person cannot be deleted. This person is required for the solution.')
    }
}
