import type { z } from 'zod'
import { validate as validateUuid } from 'uuid'
import { Interactor } from './Interactor'
import type * as req from '#shared/domain/requirements'
import { ReqType, WorkflowState } from '#shared/domain/requirements/enums'
import { MINIMUM_REQUIREMENT_TYPES } from '#shared/domain/requirements/minimumRequirements'
import { InvalidWorkflowStateException, MismatchException } from '#shared/domain/exceptions'
import type { PermissionInteractor, AppUserInteractor } from '.'
import type { AuditMetadata, AuditMetadataType } from '#shared/domain'
import type { RequirementRepository } from '~~/server/data/repositories/RequirementRepository'
import type { NaturalLanguageToRequirementService } from '~~/server/data/services/NaturalLanguageToRequirementService'

type ReqTypeName = keyof typeof req

export class RequirementInteractor extends Interactor<req.RequirementType> {
    private readonly _permissionInteractor: PermissionInteractor
    private readonly _appUserInteractor: AppUserInteractor
    private readonly _solutionId: string
    private readonly _organizationId: string

    /**
     * Create a new RequirementInteractor
     *
     * @param props.repository - The repository to use
     * @param props.permissionInteractor - The PermissionInteractor instance
     * @param props.appUserInteractor - The AppUserInteractor instance
     */
    constructor(props: {
        // FIXME: Repository<req.RequirementType>
        repository: RequirementRepository
        permissionInteractor: PermissionInteractor
        appUserInteractor: AppUserInteractor
        solutionId: string
        organizationId: string
    }) {
        super(props)
        this._organizationId = props.organizationId
        this._solutionId = props.solutionId
        this._permissionInteractor = props.permissionInteractor
        this._appUserInteractor = props.appUserInteractor

        // TODO: Implement, or update to only rely on the solutionId as a dependency
        // this._assertSolutionBelongsToOrganization();
    }

    /**
     * Enrich requirement data with user information
     * @param requirement - The requirement to enrich
     * @returns The requirement with enriched user data
     */
    private async _enrichUserData<T extends req.RequirementType>(requirement: T): Promise<T> {
        try {
            const enrichedRequirement = { ...requirement }

            if (requirement.createdBy?.id) {
                try {
                    const createdByUser = await this._appUserInteractor.getUserById(requirement.createdBy.id, this._organizationId)
                    enrichedRequirement.createdBy = {
                        id: createdByUser.id,
                        name: createdByUser.name
                    }
                } catch {
                    // Keep the existing data if user lookup fails
                }
            }

            if (requirement.modifiedBy?.id) {
                try {
                    const modifiedByUser = await this._appUserInteractor.getUserById(requirement.modifiedBy.id, this._organizationId)
                    enrichedRequirement.modifiedBy = {
                        id: modifiedByUser.id,
                        name: modifiedByUser.name
                    }
                } catch {
                    // Keep the existing data if user lookup fails
                }
            }

            return enrichedRequirement
        } catch {
            return requirement
        }
    }

    // FIXME: this shouldn't be necessary
    get repository(): RequirementRepository {
        return this._repository as RequirementRepository
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
        for (const [key, value] of Object.entries(reqProps) as [keyof typeof reqProps, string | { id: string }][]) {
            const id = typeof value === 'string' && validateUuid(value)
                ? value
                : typeof value === 'object' && 'id' in value ? value.id : undefined

            if (!id) continue

            try {
                const result = await this.repository.getById(id)

                if (key === 'solution')
                    if (result.id !== this._solutionId) throw new MismatchException(`Requirement with id ${reqProps['id']} does not belong to the solution`)
            } catch {
                throw new MismatchException(`Requirement with id ${value} does not belong to the solution`)
            }
        }
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
        for (const [key, value] of Object.entries(reqProps) as [keyof typeof reqProps, string | { id: string }][]) {
            // Skip non-reference fields
            if (key === 'solution') continue

            const id = typeof value === 'string' && validateUuid(value)
                ? value
                : typeof value === 'object' && 'id' in value ? value.id : undefined

            if (!id) continue

            try {
                const result = await this.repository.getById(id)

                if (result.workflowState !== WorkflowState.Active) {
                    throw new InvalidWorkflowStateException(
                        dedent(`
                            Cannot approve requirement because referenced requirement
                            '${result.name}' (${key}) is in ${result.workflowState} state
                            instead of Active. All referenced requirements must be Active
                            before this requirement can be approved.
                        `)
                    )
                }
            } catch (error) {
                if (error instanceof InvalidWorkflowStateException)
                    throw error

                throw new MismatchException(`Referenced requirement with id ${id} not found`)
            }
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
        this._permissionInteractor.assertOrganizationReader(this._organizationId)

        const result = await this.repository.getById(id)

        if (result.reqType !== reqType) throw new MismatchException(`Requirement with id ${id} is not of type ${reqType}`)

        const enrichedResult = await this._enrichUserData(result)

        return enrichedResult as R
    }

    /**
     * Get the current active requirements of a given type.
     * @param reqType - The type of the requirements to get
     * @returns The current active requirements of the given type
     * @throws {PermissionDeniedException} If the user is not a reader of the organization or better
     */
    async getCurrentActiveRequirementsByType<R extends ReqTypeName>(reqType: ReqType): Promise<z.infer<typeof req[R]>[]> {
        this._permissionInteractor.assertOrganizationReader(this._organizationId)

        return this.repository.getAllActive({
            solutionId: this._solutionId,
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
        this._permissionInteractor.assertOrganizationReader(this._organizationId)

        return this.repository.getAllLatest({
            solutionId: this._solutionId,
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
        this._permissionInteractor.assertOrganizationReader(this._organizationId)

        return this.repository.getAll({
            solutionId: this._solutionId,
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
    async getAllVisibleRequirementsByType<R extends ReqTypeName>(reqType: ReqType): Promise<z.infer<typeof req[R]>[]> {
        this._permissionInteractor.assertOrganizationReader(this._organizationId)

        // Get requirements from all visible states
        const visibleStates = [WorkflowState.Active, WorkflowState.Proposed, WorkflowState.Review],
            allRequirements = await Promise.all(
                visibleStates.map(workflowState =>
                    this.repository.getAllLatest({
                        solutionId: this._solutionId,
                        reqType,
                        workflowState
                    })
                )
            ),
            // Flatten and return unique requirements (deduplicate by id)
            flatRequirements = allRequirements.flat(),
            uniqueRequirements = flatRequirements.reduce((acc, req) => {
                if (!acc.find(existing => existing.id === req.id))
                    acc.push(req)

                return acc
            }, [] as z.infer<typeof req[R]>[])

        return uniqueRequirements
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
        this._permissionInteractor.assertOrganizationContributor(this._organizationId)

        const currentUserId = this._permissionInteractor.userId,
            results = await props.service.parse(props.statement)

        if (!results || results.length === 0) throw new MismatchException('No requirements found in the statement')

        const newId = await this.repository.addParsedRequirements({
            createdById: currentUserId,
            creationDate: new Date(),
            solutionId: this._solutionId,
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
        this._permissionInteractor.assertOrganizationContributor(this._organizationId)
        await this.assertReferencedRequirementsBelongToSolution(props)

        const currentUserId = this._permissionInteractor.userId

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
                solution: { id: this._solutionId, name: '', reqType: ReqType.SOLUTION },
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
        this._permissionInteractor.assertOrganizationContributor(this._organizationId)
        await this.assertReferencedRequirementsBelongToSolution(reqProps)

        const currentRequirement = await this.repository.getById(reqProps.id),
            currentUserId = this._permissionInteractor.userId

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
        this._permissionInteractor.assertOrganizationContributor(this._organizationId)

        const currentRequirement = await this.repository.getById(id)

        if (currentRequirement.reqType === ReqType.PARSED_REQUIREMENTS)
            throw new MismatchException('ReqType.PARSED_REQUIREMENTS is not allowed.')

        if (currentRequirement.workflowState !== WorkflowState.Proposed)
            throw new InvalidWorkflowStateException(`Requirement with id ${id} is not in the Proposed state`)

        return this.repository.update({
            reqProps: {
                id,
                reqType: currentRequirement.reqType,
                workflowState: WorkflowState.Removed
            },
            modifiedById: this._permissionInteractor.userId,
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
        this._permissionInteractor.assertOrganizationContributor(this._organizationId)

        const currentRequirement = await this.repository.getById(id)

        if (currentRequirement.reqType === ReqType.PARSED_REQUIREMENTS)
            throw new MismatchException('ReqType.PARSED_REQUIREMENTS is not allowed.')

        if (currentRequirement.reqType === ReqType.SILENCE)
            throw new MismatchException('Silence requirements cannot be submitted for review.')

        if (currentRequirement.workflowState !== WorkflowState.Proposed)
            throw new InvalidWorkflowStateException(`Requirement with id ${id} is not in the Proposed state`)

        return this.repository.update({
            reqProps: {
                id,
                reqType: currentRequirement.reqType,
                workflowState: WorkflowState.Review
            },
            modifiedById: this._permissionInteractor.userId,
            modifiedDate: new Date()
        })
    }

    /**
     * Rejects a requirement currently in the Review state.
     * This will change the state to Rejected.
     * @param id - The id of the requirement to reject
     * @throws {InvalidWorkflowStateException} If the requirement is not currently in the Review state.
     * @throws {PermissionDeniedException} If the user is not a contributor of the organization or better
     * @throws {MismatchException} If ReqType.SILENCE or ReqType.PARSED_REQUIREMENTS is provided
     * @throws {NotFoundException} If the requirement does not exist
     */
    async rejectRequirement(
        id: req.RequirementType['id']
    ): Promise<void> {
        this._permissionInteractor.assertOrganizationContributor(this._organizationId)

        const currentRequirement = await this.repository.getById(id)

        if (currentRequirement.reqType === ReqType.PARSED_REQUIREMENTS)
            throw new MismatchException('ReqType.PARSED_REQUIREMENTS is not allowed.')

        if (currentRequirement.reqType === ReqType.SILENCE)
            throw new MismatchException('Silence requirements cannot be rejected. They can only be removed.')

        if (currentRequirement.workflowState !== WorkflowState.Review)
            throw new InvalidWorkflowStateException(`Requirement with id ${id} is not in the Review state`)

        return this.repository.update({
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

        const currentRequirement = await this.repository.getById(id)

        if (currentRequirement.reqType === ReqType.PARSED_REQUIREMENTS)
            throw new MismatchException(`Requirement with id ${id} is of type PARSED_REQUIREMENTS and cannot be restored`)

        if (currentRequirement.reqType === ReqType.SILENCE)
            throw new MismatchException(`Silence requirements cannot be approved.`)

        if (currentRequirement.workflowState !== WorkflowState.Review)
            throw new InvalidWorkflowStateException(`Requirement with id ${id} is not in the Review state`)

        // Validate that all referenced requirements are Active before approving
        await this.assertReferencedRequirementsAreActive(currentRequirement)

        return this.repository.update({
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
        this._permissionInteractor.assertOrganizationContributor(this._organizationId)

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
            modifiedById: this._permissionInteractor.userId,
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
        this._permissionInteractor.assertOrganizationContributor(this._organizationId)

        const currentRequirement = await this.repository.getById(id)

        if (currentRequirement.reqType === ReqType.PARSED_REQUIREMENTS)
            throw new InvalidWorkflowStateException(`Requirement with id ${id} is of type PARSED_REQUIREMENTS and cannot be removed`)

        if (currentRequirement.workflowState !== WorkflowState.Rejected)
            throw new InvalidWorkflowStateException(`Requirement with id ${id} is not in the Rejected state`)

        return this.repository.update({
            reqProps: {
                id,
                reqType: currentRequirement.reqType,
                workflowState: WorkflowState.Removed
            },
            modifiedById: this._permissionInteractor.userId,
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
        this._permissionInteractor.assertOrganizationContributor(this._organizationId)

        const currentRequirement = await this.repository.getById(id)

        if (currentRequirement.workflowState !== WorkflowState.Removed)
            throw new InvalidWorkflowStateException(`Requirement with id ${id} is not in the Removed state`)

        if (currentRequirement.reqType === ReqType.PARSED_REQUIREMENTS)
            throw new MismatchException(`Requirement with id ${id} is of type PARSED_REQUIREMENTS and cannot be restored`)

        // Silence requirements cannot be restored - they remain in the Removed state permanently
        if (currentRequirement.reqType === ReqType.SILENCE)
            throw new InvalidWorkflowStateException(`Silence requirements cannot be restored once removed.`)

        return this.repository.update({
            reqProps: {
                id,
                reqType: currentRequirement.reqType,
                workflowState: WorkflowState.Proposed
            },
            modifiedById: this._permissionInteractor.userId,
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
        this._permissionInteractor.assertOrganizationContributor(this._organizationId)

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
            modifiedById: this._permissionInteractor.userId,
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
        this._permissionInteractor.assertOrganizationContributor(this._organizationId)

        const currentRequirement = await this.repository.getById(id)

        if (currentRequirement.reqType === ReqType.PARSED_REQUIREMENTS)
            throw new MismatchException('ReqType.PARSED_REQUIREMENTS is not allowed.')

        if (currentRequirement.workflowState !== WorkflowState.Active)
            throw new InvalidWorkflowStateException(`Requirement with id ${id} is not in the Active state`)

        return this.repository.update({
            reqProps: {
                id,
                reqType: currentRequirement.reqType,
                workflowState: WorkflowState.Removed
            },
            modifiedById: this._permissionInteractor.userId,
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
        this._permissionInteractor.assertOrganizationReader(this._organizationId)

        const activeRequirements = await this.repository.getAllActive({
            solutionId: this._solutionId,
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
        this._permissionInteractor.assertOrganizationReader(this._organizationId)

        const missing: ReqType[] = []

        for (const reqType of MINIMUM_REQUIREMENT_TYPES) {
            const hasActive = await this.hasActiveRequirements(reqType)
            if (!hasActive)
                missing.push(reqType)
        }

        return missing
    }
}
