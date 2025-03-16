import type { z } from "zod";
import { validate as validateUuid } from 'uuid'
import * as req from "#shared/domain/requirements";
import { ReqType } from "#shared/domain/requirements/ReqType";
import { AppRole, type AppUser } from "#shared/domain/application";
import type { AuditMetadata } from "#shared/domain/AuditMetadata";
import { MismatchException, NotFoundException, PermissionDeniedException } from "#shared/domain/exceptions";
import type { OrganizationRepository } from "~/server/data/repositories/OrganizationRepository";
import { Interactor } from "./Interactor";

/**
 * The OrganizationInteractor class contains the business logic for interacting with an organization.
 */
export class OrganizationInteractor extends Interactor<z.infer<typeof req.Organization>> {
    /**
     * Create a new OrganizationInteractor
     *
     * @param props.repository - The repository to use
     * @param props.userId - The id of the user to utilize
     */
    constructor(props: {
        // TODO: This should be Repository<Organization>
        repository: OrganizationRepository,
        userId: z.infer<typeof AppUser>['id']
    }) { super(props) }

    // FIXME: this shouldn't be necessary
    get repository(): OrganizationRepository {
        return this._repository as OrganizationRepository
    }

    /**
     * Add an appuser to the organization with a role
     *
     * @param props.appUserId The id of the app user to invite
     * @param props.organizationId The id of the organization to add the app user to
     * @param props.role The role to assign to the app user
     * @throws {PermissionDeniedException} If the user is not an admin of the organization
     * @throws {DuplicateEntityException} If the target app user is already associated with the organization
     */
    async addAppUserOrganizationRole(props: { appUserId: string, organizationId: string, role: AppRole }): Promise<void> {
        if (!await this.isOrganizationAdmin())
            throw new PermissionDeniedException('Forbidden: You do not have permission to perform this action')

        this.repository.addAppUserOrganizationRole({
            createdById: this._userId,
            effectiveDate: new Date(),
            ...props
        })
    }

    /**
     * Add a new requirement to a solution and assign it a new requirement id
     *
     * @param props.solutionId - The id of the solution to add the requirement to
     * @param props.reqProps - The requirement data to add
     * @returns The id of the new requirement
     * @throws {PermissionDeniedException} If the user is not a contributor of the organization or better
     * @throws {MismatchException} If a referenced requirement does not belong to the solution
     * @throws {NotFoundException} If the solution does not exist
     */
    async addRequirement<R extends keyof typeof req>({
        solutionId, reqProps
    }: {
        solutionId: z.infer<typeof req.Solution>['id'],
        reqProps: Omit<z.infer<typeof req[R]>, 'reqId' | 'id' | keyof z.infer<typeof AuditMetadata>> & { reqType: ReqType }
    }): Promise<z.infer<typeof req[R]>['id']> {
        if (!this.isOrganizationContributor())
            throw new PermissionDeniedException('Forbidden: You do not have permission to perform this action')

        await this._assertReferencedRequirementsBelongToSolution({ solutionId, reqProps })

        return await this.repository.addRequirement({
            solutionId,
            reqProps,
            createdById: this._userId,
            effectiveDate: new Date()
        })
    }

    /**
     * Add a solution to an organization
     *
     * @param props The properties of the solution
     * @returns The new solution
     * @throws {PermissionDeniedException} If the user is not an admin of the organization
     * @throws {NotFoundException} If the organization does not exist
     */
    async addSolution({ name, description }: Pick<z.infer<typeof req.Solution>, 'name' | 'description'>): Promise<z.infer<typeof req.Solution>['id']> {
        const repo = this.repository,
            effectiveDate = new Date()

        if (!await this.isOrganizationAdmin())
            throw new PermissionDeniedException('Forbidden: You do not have permission to perform this action')

        const newSolutionId = await repo.addSolution({ name, description, effectiveDate, createdById: this._userId })

        // create initial requirements for the solution
        await this.addRequirement({
            solutionId: newSolutionId,
            reqProps: { reqType: ReqType.OUTCOME, name: 'G.1', description: 'Context and Objective', isSilence: false }
        })

        await this.addRequirement({
            solutionId: newSolutionId,
            reqProps: { reqType: ReqType.OBSTACLE, name: 'G.2', description: 'Situation', isSilence: false }
        })

        return newSolutionId
    }

    /**
     * Delete an app user from the current organization
     *
     * @param id The id of the app user to delete
     * @throws {PermissionDeniedException} If the user is not an admin of the organization unless the user is deleting themselves
     * @throws {PermissionDeniedException} If the user is deleting the last admin of the organization
     * @throws {NotFoundException} If the target app user does not exist
     */
    async deleteAppUser(id: z.infer<typeof AppUser>['id']): Promise<void> {
        if (!this.isOrganizationAdmin() && id !== this._userId)
            throw new PermissionDeniedException('Forbidden: You do not have permission to perform this action')

        const targetUser = await this.getAppUserById(id),
            orgAdminCount = (await this.repository.findAppUserOrganizationRoles({
                role: AppRole.ORGANIZATION_ADMIN
            })).length

        if (targetUser.role === AppRole.ORGANIZATION_ADMIN && orgAdminCount === 1)
            throw new PermissionDeniedException('Forbidden: You cannot delete the last organization admin.')

        return this.repository.deleteAppUserOrganizationRole({
            appUserId: id,
            deletedById: this._userId,
            deletedDate: new Date()
        })
    }

    /**
     * Delete a requirement by id from the specified solution
     *
     * @param props.id - The id of the requirement to delete
     * @param props.solutionId - The id of the solution that the requirement belongs to
     * @param props.reqType - The type of the requirement to delete
     * @throws {NotFoundException} If the solution does not exist
     * @throws {PermissionDeniedException} If the user is not a contributor of the organization or better
     * @throws {NotFoundException} If the requirement does not exist
     * @throws {MismatchException} If the requirement does not belong to the solution
     */
    async deleteRequirement(props: {
        id: z.infer<typeof req.Requirement>['id'],
        solutionId: z.infer<typeof req.Solution>['id'],
        reqType: ReqType
    }): Promise<void> {
        if (!this.isOrganizationContributor())
            throw new PermissionDeniedException('Forbidden: You do not have permission to perform this action')

        await this.repository.deleteSolutionRequirementById({
            deletedById: this._userId,
            deletedDate: new Date(),
            reqType: props.reqType,
            id: props.id,
            solutionId: props.solutionId
        })

        // TODO: decrement the reqId of all requirements that have a reqId greater than the deleted requirement
        // see https://github.com/final-hill/cathedral/issues/475
    }

    /**
     * Delete a solution by slug from an organization
     *
     * @param slug The id of the solution to delete
     * @throws {PermissionDeniedException} If the user is not an admin of the organization
     * @throws {NotFoundException} If the solution does not exist
     * @throws {MismatchException} If the solution does not belong to the organization
     */
    async deleteSolutionBySlug(slug: z.infer<typeof req.Solution>['slug']): Promise<void> {
        if (!await this.isOrganizationAdmin())
            throw new PermissionDeniedException('Forbidden: You do not have permission to perform this action')

        return this.repository.deleteSolutionBySlug({
            deletedById: this._userId,
            deletedDate: new Date(),
            slug
        })
    }

    /**
     * Find requirements that match the query parameters for a solution
     *
     * @param props.solutionId - The id of the solution to find the requirements for
     * @param props.query - The query parameters to filter requirements by
     * @returns The requirements that match the query parameters
     * @throws {PermissionDeniedException} If the user is not a reader of the organization or better
     */
    async findSolutionRequirements<R extends keyof typeof req>(props: {
        solutionId: z.infer<typeof req.Solution>['id'],
        query: Partial<z.infer<typeof req[R]>> & { reqType: ReqType }
    }): Promise<z.infer<typeof req[R]>[]> {
        if (!this.isOrganizationReader())
            throw new PermissionDeniedException('Forbidden: You do not have permission to perform this action')

        return this.repository.findSolutionRequirements(props)
    }

    /**
     * Find solutions that match the query parameters for an organization
     *
     * @param query The query parameters to filter solutions by
     * @returns The solutions that match the query parameters
     * @throws {PermissionDeniedException} If the user is not a reader of the organization or better
     * @throws {NotFoundException} If the organization does not exist
     */
    async findSolutions(query: Partial<z.infer<typeof req.Solution>> = {}): Promise<z.infer<typeof req.Solution>[]> {
        if (!await this.isOrganizationReader())
            throw new PermissionDeniedException('Forbidden: You do not have permission to perform this action')

        return this.repository.findSolutions(query)
    }

    /**
     * Get an app user by id
     *
     * @param id The id of the app user to get
     * @returns The app user
     * @throws {NotFoundException} If the app user does not exist
     * @throws {PermissionDeniedException} If the user is not a reader of the organization or better
     * @throws {PermissionDeniedException} If the user is trying to get an app user that is not in the same organization
     */
    async getAppUserById(id: z.infer<typeof AppUser>['id']): Promise<z.infer<typeof AppUser>> {
        if (!this.isOrganizationReader())
            throw new PermissionDeniedException('Forbidden: You do not have permission to perform this action')
        return this.repository.getOrganizationAppUserById(id)
    }

    /**
     * Returns the organization that the user is associated with
     *
     * @returns The organization
     * @throws {NotFoundException} If the organization does not exist
     */
    async getOrganization(): Promise<z.infer<typeof req.Organization>> {
        if (!this.isOrganizationReader())
            throw new NotFoundException('Forbidden: You do not have permission to perform this action')
        return this.repository.getOrganization()
    }

    /**
     * Get all app users for the organization with their associated roles
     *
     * @returns The app users with their associated roles
     * @throws {PermissionDeniedException} If the user is not a reader of the organization or better
     */
    async getOrganizationAppUsers(): Promise<z.infer<typeof AppUser>[]> {
        if (!this.isOrganizationReader())
            throw new PermissionDeniedException('Forbidden: You do not have permission to perform this action')

        return this.repository.getOrganizationAppUsers()
    }

    /**
     * Get a solution by id
     *
     * @param solutionId The id of the solution to get
     * @returns The solution
     * @throws {PermissionDeniedException} If the user is not a reader of the organization or better
     * @throws {NotFoundException} If the solution does not exist
     * @throws {MismatchException} If the solution does not belong to the organization
     */
    async getSolutionById(solutionId: z.infer<typeof req.Solution>['id']): Promise<z.infer<typeof req.Solution>> {
        if (!await this.isOrganizationReader())
            throw new PermissionDeniedException('Forbidden: You do not have permission to perform this action')

        return this.repository.getSolutionById(solutionId)
    }

    /**
     * Get a solution by slug
     *
     * @param slug The slug of the solution to get
     * @returns The solution
     * @throws {PermissionDeniedException} If the user is not a reader of the organization or better
     * @throws {NotFoundException} If the solution does not exist
     * @throws {MismatchException} If the solution does not belong to the organization
     */
    async getSolutionBySlug(slug: z.infer<typeof req.Solution>['slug']): Promise<z.infer<typeof req.Solution>> {
        if (!await this.isOrganizationReader())
            throw new PermissionDeniedException('Forbidden: You do not have permission to perform this action')

        return this.repository.getSolutionBySlug(slug)
    }

    /**
     * Get a requirement by id
     *
     * @param props.reqType The type of the requirement to get
     * @param props.id The id of the requirement to get
     * @param props.solutionId The id of the solution that the requirement belongs to
     * @returns The requirement
     * @throws {PermissionDeniedException} If the user is not a reader of the organization or better
     * @throws {NotFoundException} If the requirement does not exist in the organization nor the solution
     */
    async getSolutionRequirementById<R extends keyof typeof req>(props: {
        reqType: ReqType,
        solutionId: z.infer<typeof req.Solution>['id'],
        id: z.infer<typeof req.Requirement>['id']
    }): Promise<z.infer<typeof req[R]>> {
        if (!this.isOrganizationReader())
            throw new PermissionDeniedException('Forbidden: You do not have permission to perform this action')

        return await this.repository.getSolutionRequirementById({
            reqType: props.reqType,
            solutionId: props.solutionId,
            id: props.id
        })
    }

    /**
     * Check if the current user is an admin of the organization or a system admin
     * @returns The result of the check
     * @throws {NotFoundException} If the organization does not exist
     * @throws {NotFoundException} If the app user does not exist in the organization
     * @throws {NotFoundException} If the app user organization role does not exist
     */
    async isOrganizationAdmin(): Promise<boolean> {
        const appUser = await this.repository.getOrganizationAppUserById(this._userId)

        if (appUser.isSystemAdmin) return true

        const auor = await this.repository.getAppUserOrganizationRole(appUser.id),
            isOrgAdmin = auor?.role ?
                [AppRole.ORGANIZATION_ADMIN].includes(auor.role)
                : false

        return isOrgAdmin
    }

    /**
     * Check if the current user is a contributor of the organization or a system admin
     * @returns The result of the check
     * @throws {NotFoundException} If the organization does not exist
     * @throws {NotFoundException} If the app user does not exist in the organization
     * @throws {NotFoundException} If the app user organization role does not exist
     */
    async isOrganizationContributor(): Promise<boolean> {
        const appUser = await this.repository.getOrganizationAppUserById(this._userId)

        if (appUser.isSystemAdmin) return true

        const auor = await this.repository.getAppUserOrganizationRole(appUser.id),
            isOrgContributor = auor?.role ?
                [AppRole.ORGANIZATION_ADMIN, AppRole.ORGANIZATION_CONTRIBUTOR].includes(auor.role)
                : false

        return isOrgContributor
    }

    /**
     * Check if the current user is a reader of the organization or a system admin
     * @returns The result of the check
     * @throws {NotFoundException} If the organization does not exist
     * @throws {NotFoundException} If the app user does not exist in the organization
     * @throws {NotFoundException} If the app user organization role does not exist
     */
    async isOrganizationReader(): Promise<boolean> {
        const appUser = await this.repository.getOrganizationAppUserById(this._userId)

        if (appUser.isSystemAdmin) return true

        const auor = await this.repository.getAppUserOrganizationRole(appUser.id),
            isOrgReader = auor?.role ?
                [AppRole.ORGANIZATION_ADMIN, AppRole.ORGANIZATION_CONTRIBUTOR, AppRole.ORGANIZATION_READER].includes(auor.role)
                : false

        return isOrgReader
    }

    /**
     * Update a target user by id in a given organization to have a new role
     *
     * @param id The id of the target user to update
     * @param role The new role to assign to the target user
     * @throws {PermissionDeniedException} If the current user is not an admin of the organization
     * @throws {NotFoundException} If the target user does not exist
     * @throws {PermissionDeniedException} If the target user is not in the same organization
     * @throws {PermissionDeniedException} If the target user is the last admin of the organization and the new role is not an admin
     * @throws {PermissionDeniedException} If the target user is trying to update themselves
     */
    async updateAppUserRole(id: z.infer<typeof AppUser>['id'], role: AppRole): Promise<void> {
        if (!this.isOrganizationAdmin())
            throw new PermissionDeniedException('Forbidden: You do not have permission to perform this action')

        const targetUser = await this.getAppUserById(id)

        if (targetUser.id === this._userId)
            throw new PermissionDeniedException('Forbidden: You cannot update your own role.')

        if (targetUser.role === AppRole.ORGANIZATION_ADMIN && role !== AppRole.ORGANIZATION_ADMIN)
            throw new PermissionDeniedException('Forbidden: You cannot remove the last organization admin.')

        await this.repository.updateAppUserRole({
            appUserId: id,
            role,
            modifiedById: this._userId,
            modifiedDate: new Date
        })
    }

    /**
     * Assert that all requirement references (uuid properties) belong to the same solution.
     * This is to prevent a requirement from another solution being added to the current solution.
     * This is a security measure to prevent unauthorized access to requirements
     * @param props.solutionId The id of the solution that the requirements belong to
     * @param props.reqProps The properties of the requirements to check
     * @throws {MismatchException} If a referenced requirement does not belong to the solution
     */
    private async _assertReferencedRequirementsBelongToSolution(props: {
        solutionId: z.infer<typeof req.Solution>['id'],
        reqProps: Partial<Omit<z.infer<typeof req.Requirement>, 'reqId' | keyof z.infer<typeof AuditMetadata>>>
    }) {
        for (const [_, value] of Object.entries(props.reqProps) as [keyof typeof props.reqProps, string][]) {
            if (validateUuid(value)) {
                const solHasReq = await this.repository.solutionHasRequirement({ id: value, solutionId: props.solutionId })

                if (!solHasReq)
                    throw new MismatchException(`Requirement with id ${value} does not belong to the solution`)
            }
        }
    }

    /**
     * Update a requirement by id for a solution with the given properties
     *
     * @param props.id The id of the requirement to update
     * @param props.solutionId The id of the solution that the requirement belongs to
     * @param props.reqProps The properties to update
     * @throws {PermissionDeniedException} If the user is not a contributor of the organization or better
     * @throws {NotFoundException} If the requirement does not exist
     * @throws {NotFoundException} If the solution does not exist
     * @throws {MismatchException} If the requirement is not owned by the solution
     * @throws {MismatchException} If a referenced requirement does not belong to the solution
     */
    async updateSolutionRequirement<R extends keyof typeof req>(props: {
        id: z.infer<typeof req[R]>['id'],
        solutionId: z.infer<typeof req.Solution>['id'],
        reqProps: Partial<Omit<z.infer<typeof req[R]>, 'id' | 'reqId' | keyof z.infer<typeof AuditMetadata>>> & { reqType: ReqType }
    }): Promise<void> {
        if (!this.isOrganizationContributor())
            throw new PermissionDeniedException('Forbidden: You do not have permission to perform this action')

        await this._assertReferencedRequirementsBelongToSolution({
            solutionId: props.solutionId,
            reqProps: props.reqProps
        })

        await this.repository.updateSolutionRequirement({
            modifiedById: this._userId,
            modifiedDate: new Date(),
            requirementId: props.id,
            solutionId: props.solutionId,
            reqProps: props.reqProps
        })
    }

    /**
     * Update a solution by slug with the given properties
     *
     * @param slug The slug of the solution to update
     * @param props The properties to update
     * @throws {PermissionDeniedException} If the user is not a contributor of the organization or better
     * @throws {NotFoundException} If the solution does not exist
     * @throws {MismatchException} If the solution does not belong to the organization
     */
    async updateSolutionBySlug(slug: z.infer<typeof req.Solution>['slug'], props: Pick<Partial<z.infer<typeof req.Solution>>, 'name' | 'description'>): Promise<void> {
        if (!await this.isOrganizationContributor())
            throw new PermissionDeniedException('Forbidden: You do not have permission to perform this action')

        await this.repository.updateSolutionBySlug(slug, {
            modifiedById: this._userId,
            modifiedDate: new Date(),
            ...props
        })
    }

    /**
     * Get all unapproved (isSilence) requirements that follow from the specified ParsedRequirement for a Solution
     * @param props.solutionId The id of the solution that the requirement belongs to
     * @param props.id The id of the ParsedRequirement to get the requirements that follow from it
     * @returns The requirements that follow from the specified ParsedRequirement
     * @throws {PermissionDeniedException} If the user is not a reader of the organization or better
     * @throws {NotFoundException} If the ParsedRequirement does not exist
     * @throws {MismatchException} If the ParsedRequirement does not belong to the solution
     * /
    // TODO: refactor to use the repository
    async getFollowingParsedSilenceRequirements({ solutionId, id }: { solutionId: req.Solution['id'], id: req.Requirement['id'] }): Promise<Partial<Record<ReqType, Requirement[]>>> {
        if (!this.isOrganizationReader())
            throw new PermissionDeniedException('Forbidden: You do not have permission to perform this action')

        const parsedRequirement = await this.getSolutionRequirementById({ solutionId, ReqClass: ParsedRequirement, id })

        if (!parsedRequirement)
            throw new Error('Not Found: The ParsedRequirement does not exist.')

        // Get all unapproved requirements that follow from the specified ParsedRequirement
        const requirements = await parsedRequirement.followedByIds.loadItems<Requirement>({
            where: { isSilence: true }
        })

        // Group the results by the requirement type
        return Object.groupBy(requirements, ({ req_type }) => req_type)
    }
    */

    /**
     * Parse requirements from a statement, save the parsed requirements to the database
     *
     * @param props.solutionId The id of the solution to add the requirements to
     * @param props.statement The statement to parse requirements from
     * @param props.parsingService The parsing service to use
     * @returns The number of requirements parsed
     * @throws {PermissionDeniedException} If the user is not a contributor of the organization or better
     * @throws {MismatchException} If the Solution does not belong to the organization
     * /
    async parseRequirement({ solutionId, statement, parsingService }: {
        solutionId: req.Solution['id'],
        statement: string,
        // FIXME: This should no be the explicit service but a generic service
        parsingService: NaturalLanguageToRequirementService
    }): Promise<number> {
        if (!this.isOrganizationContributor())
            throw new PermissionDeniedException('Forbidden: You do not have permission to perform this action')

        const appUser = await this._userId,
            em = this.getEntityManager(),
            solution = await this.getSolutionById(solutionId)

        const groupedResult = await parsingService.parse(statement)

        const parsedRequirement = em.create(req.ParsedRequirement, {
            name: '{LLM Parsed Requirement}',
            description: statement,
            createdBy: appUser,
            modifiedBy: appUser,
            lastModified: new Date(),
            isSilence: true
        })

        em.create(Belongs, { left: parsedRequirement, right: solution })

        // FIXME: need a better type than 'any'
        const addSolReq = (ReqClass: typeof req.Requirement, props: any) => {
            const req = em.create(ReqClass, {
                ...props,
                isSilence: true,
                lastModified: new Date(),
                modifiedBy: appUser,
                createdBy: appUser
            })

            em.create(Belongs, { left: req, right: solution })

            return req
        }

        // FIXME: need a better type than 'any'
        const addParsedReq = (ReqClass: typeof req.Requirement, props: any) => {
            const req = addSolReq(ReqClass, props)
            em.create(Follows, { left: req, right: parsedRequirement })

            return req
        };

        groupedResult.Assumption?.forEach((item) => addParsedReq(req.Assumption, item));
        groupedResult.Constraint?.forEach((item) => addParsedReq(req.Constraint, item));
        groupedResult.Effect?.forEach((item) => addParsedReq(req.Effect, item));
        groupedResult.EnvironmentComponent?.forEach((item) => addParsedReq(req.EnvironmentComponent, item));
        groupedResult.FunctionalBehavior?.forEach((item) => addParsedReq(req.FunctionalBehavior, item));
        groupedResult.GlossaryTerm?.forEach((item) => addParsedReq(req.GlossaryTerm, item));
        groupedResult.Invariant?.forEach((item) => addParsedReq(req.Invariant, item));
        groupedResult.Justification?.forEach((item) => addParsedReq(req.Justification, item));
        groupedResult.Limit?.forEach((item) => addParsedReq(req.Limit, item));
        groupedResult.NonFunctionalBehavior?.forEach((item) => addParsedReq(req.NonFunctionalBehavior, item));
        groupedResult.Obstacle?.forEach((item) => addParsedReq(req.Obstacle, item));
        groupedResult.Outcome?.forEach((item) => addParsedReq(req.Outcome, item));
        groupedResult.Person?.forEach((item) => addParsedReq(req.Person, item));
        groupedResult.Stakeholder?.forEach((item) => addParsedReq(req.Stakeholder, item));
        groupedResult.SystemComponent?.forEach((item) => addParsedReq(req.SystemComponent, item));
        groupedResult.UseCase?.forEach((item) => {
            addParsedReq(req.UseCase, {
                extensions: item.extensions,
                outcome: addSolReq(req.Outcome, {
                    name: item.name,
                    description: item.outcome
                }),
                level: item.level,
                mainSuccessScenario: item.mainSuccessScenario,
                scope: item.scope,
                name: item.name,
                description: '',
                priority: item.moscowPriority as req.MoscowPriority ?? req.MoscowPriority.MUST,
                // triggerId: undefined,
                precondition: addSolReq(req.Assumption, {
                    name: item.name,
                    description: item.precondition
                }),
                successGuarantee: addSolReq(req.Effect, {
                    name: item.name,
                    description: item.successGuarantee
                }),
                primaryActor: addSolReq(req.Stakeholder, {
                    name: item.primaryActor,
                    availability: 50,
                    influence: 50,
                    description: '',
                    category: req.StakeholderCategory.KEY_STAKEHOLDER,
                    segmentation: req.StakeholderSegmentation.VENDOR,
                })
            })
        });
        (groupedResult.UserStory ?? []).forEach((item) => {
            addParsedReq(req.UserStory, {
                priority: item.moscowPriority as req.MoscowPriority ?? req.MoscowPriority.MUST,
                name: item.name,
                description: '',
                functionalBehavior: addSolReq(req.FunctionalBehavior, {
                    priority: item.moscowPriority as req.MoscowPriority ?? req.MoscowPriority.MUST,
                    name: item.functionalBehavior,
                    description: item.functionalBehavior
                }),
                outcome: addSolReq(req.Outcome, {
                    name: item.outcome,
                    description: item.outcome
                }),
                primaryActor: addSolReq(req.Stakeholder, {
                    name: item.role,
                    availability: 50,
                    influence: 50,
                    description: '',
                    category: req.StakeholderCategory.KEY_STAKEHOLDER,
                    segmentation: req.StakeholderSegmentation.VENDOR
                })
            })
        });

        await em.flush()

        const reqCount = Object.values(groupedResult).reduce((acc, val) => acc + val.length, 0)

        return reqCount
    }
    */
}