import * as req from '#shared/domain/requirements'
import { ReqType, WorkflowState } from '#shared/domain/requirements/enums'
import { AppRole } from '#shared/domain/application'
import type { AppUserType } from '#shared/domain/application'
import { AppUserReference } from '#shared/domain/application/EntityReferences'
import { MismatchException, PermissionDeniedException } from '#shared/domain/exceptions'
import type { OrganizationRepository, RequirementRepository } from '~~/server/data/repositories'
import type { PermissionInteractor, AppUserInteractor } from '.'
import { Interactor } from './Interactor'
import { AppUserWithRoleDto } from '#shared/dto/AppUserWithRoleDto'
import type { AppUserWithRoleDtoType } from '#shared/dto/AppUserWithRoleDto'
import { v7 as uuid7 } from 'uuid'

/**
 * The OrganizationInteractor class contains the business logic for interacting with an organization.
 */
export class OrganizationInteractor extends Interactor<req.OrganizationType, OrganizationRepository> {
    private readonly permissionInteractor: PermissionInteractor
    private readonly appUserInteractor: AppUserInteractor
    private readonly requirementRepository?: RequirementRepository

    /**
     * Create a new OrganizationInteractor
     *
     * @param props.repository - The repository to use
     * @param props.requirementRepository - The RequirementRepository instance (optional, required only for solution creation)
     * @param props.permissionInteractor - The PermissionInteractor instance
     */
    constructor(props: {
        repository: OrganizationRepository
        requirementRepository?: RequirementRepository
        permissionInteractor: PermissionInteractor
        appUserInteractor: AppUserInteractor
    }) {
        super(props)
        this.permissionInteractor = props.permissionInteractor
        this.appUserInteractor = props.appUserInteractor
        this.requirementRepository = props.requirementRepository
    }

    /**
     * Add a solution to an organization with default mandatory roles and personnel.
     * This use case creates a solution and initializes it with Product Owner and
     * Implementation Owner roles, automatically assigning Organization Admins to them.
     *
     * @param props The properties of the solution
     * @returns The new solution ID
     * @throws {PermissionDeniedException} If the user is not an admin of the organization
     * @throws {NotFoundException} If the organization does not exist
     * @throws {NotFoundException} If no Organization Admins exist to assign to mandatory roles
     * @throws {MismatchException} If the solution name would create a reserved slug
     */
    async addSolution({ name, description }: Pick<req.SolutionType, 'name' | 'description'>): Promise<req.SolutionType['id']> {
        const organization = await this.repository.getOrganization(),
            currentUserId = this.permissionInteractor.userId,
            creationDate = new Date()

        this.permissionInteractor.assertOrganizationAdmin(organization.id)

        assertSolutionNameNotReserved(name)

        await this.assertSolutionSlugIsUnique(name)

        const newSolutionId = await this.repository.addSolution({ name, description, creationDate, createdById: currentUserId })

        await this.initializeSolutionRolesAndPersonnel({
            solutionId: newSolutionId,
            organizationId: organization.id,
            createdById: currentUserId,
            creationDate
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
    async deleteAppUser(id: AppUserType['id']): Promise<void> {
        const organization = await this.repository.getOrganization(),
            pi = this.permissionInteractor,
            currentUserId = pi.userId

        if (!(pi.isOrganizationAdmin(organization.id)) && id !== currentUserId) throw new PermissionDeniedException('Forbidden: You do not have permission to perform this action')

        const targetUserAuor = await pi.getAppUserOrganizationRole({
                appUserId: id,
                organizationId: organization.id
            }),
            orgAdminCount = await pi.findAppUserOrganizationRoles({
                organizationId: organization.id,
                role: AppRole.ORGANIZATION_ADMIN
            }).then(roles => roles.length)

        if (targetUserAuor.role === AppRole.ORGANIZATION_ADMIN && orgAdminCount === 1) throw new PermissionDeniedException('Forbidden: You cannot delete the last organization admin.')

        return pi.deleteAppUserOrganizationRole({
            appUserId: id,
            organizationId: organization.id
        })
    }

    /**
     * Delete a solution by slug from an organization
     *
     * @param slug The id of the solution to delete
     * @throws {PermissionDeniedException} If the user is not an admin of the organization
     * @throws {NotFoundException} If the solution does not exist
     * @throws {MismatchException} If the solution does not belong to the organization
     */
    async deleteSolutionBySlug(slug: req.SolutionType['slug']): Promise<void> {
        const organization = await this.repository.getOrganization(),
            currentUserId = this.permissionInteractor.userId

        this.permissionInteractor.assertOrganizationAdmin(organization.id)

        return this.repository.deleteSolutionBySlug({
            deletedById: currentUserId,
            deletedDate: new Date(),
            slug
        })
    }

    /**
     * Find solutions that match the query parameters for an organization
     *
     * @param query The query parameters to filter solutions by
     * @returns The solutions that match the query parameters
     * @throws {PermissionDeniedException} If the user is not a reader of the organization or better
     * @throws {NotFoundException} If the organization does not exist
     */
    async findSolutions(query: Partial<req.SolutionType> = {}): Promise<req.SolutionType[]> {
        const organization = await this.repository.getOrganization()

        this.permissionInteractor.assertOrganizationReader(organization.id)
        return this.repository.findSolutions(query)
    }

    /**
     * Returns the organization that the user is associated with
     *
     * @returns The organization
     * @throws {NotFoundException} If the organization does not exist
     */
    async getOrganization(): Promise<req.OrganizationType> {
        const org = await this.repository.getOrganization()
        this.permissionInteractor.assertOrganizationReader(org.id)
        return org
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
    async getAppUserById(id: AppUserType['id']): Promise<AppUserWithRoleDtoType> {
        const org = await this.repository.getOrganization(),
            pi = this.permissionInteractor,
            aui = this.appUserInteractor

        pi.assertOrganizationReader(org.id)
        const auor = await pi.getAppUserOrganizationRole({
                appUserId: id,
                organizationId: org.id
            }),

            userData = await aui.getUserById({ id: auor.appUser.id, organizationId: org.id })
        return AppUserWithRoleDto.parse({
            ...userData,
            role: auor.role,
            organizations: [{
                reqType: ReqType.ORGANIZATION,
                id: org.id,
                name: org.name
            }]
        })
    }

    /**
     * Get all app users for the organization with their associated roles
     *
     * @returns The app users with their associated roles
     * @throws {PermissionDeniedException} If the user is not a reader of the organization or better
     */
    async getAppUsers(): Promise<AppUserWithRoleDtoType[]> {
        const org = await this.repository.getOrganization(),
            pi = this.permissionInteractor,
            aui = this.appUserInteractor

        pi.assertOrganizationReader(org.id)

        const auors = await pi.findAppUserOrganizationRoles({
                organizationId: org.id
            }),
            appUsers = await Promise.all(auors.map(async (auor) => {
                const userData = await aui.getUserById({ id: auor.appUser.id, organizationId: org.id })
                return AppUserWithRoleDto.parse({
                    ...userData,
                    role: auor.role,
                    organizations: [{
                        reqType: ReqType.ORGANIZATION,
                        id: org.id,
                        name: org.name
                    }]
                })
            }))

        return appUsers
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
    async getSolutionById(solutionId: req.SolutionType['id']): Promise<req.SolutionType> {
        const org = await this.repository.getOrganization()
        this.permissionInteractor.assertOrganizationReader(org.id)
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
    async getSolutionBySlug(slug: req.SolutionType['slug']): Promise<req.SolutionType> {
        const org = await this.repository.getOrganization()
        this.permissionInteractor.assertOrganizationReader(org.id)
        return this.repository.getSolutionBySlug(slug)
    }

    /**
     * Assert that the solution slug is unique within the organization
     * @param name The name of the solution (will be slugified to check uniqueness)
     * @throws {MismatchException} If the solution slug is not unique within the organization
     */
    private async assertSolutionSlugIsUnique(name: string): Promise<void> {
        const slug = slugify(name),
            solutions = (await this.findSolutions({ slug }))

        if (solutions.length > 0) throw new MismatchException(`Solution with slug ${slug} already exists in the organization`)
    }

    /**
     * Update a solution by slug with the given properties
     *
     * @param params The properties to update
     * @param params.slug The slug of the solution to update
     * @param params.props The properties to update
     * @throws {PermissionDeniedException} If the user is not a contributor of the organization or better
     * @throws {NotFoundException} If the solution does not exist
     * @throws {MismatchException} If the solution does not belong to the organization
     * @throws {MismatchException} If the new solution name would create a reserved slug
     */
    async updateSolutionBySlug({ slug, ...props }: { slug: req.SolutionType['slug'] } & Pick<Partial<req.SolutionType>, 'name' | 'description'>): Promise<void> {
        const org = await this.repository.getOrganization(),
            currentUserId = this.permissionInteractor.userId

        this.permissionInteractor.assertOrganizationContributor(org.id)

        if (props.name) {
            assertSolutionNameNotReserved(props.name)
            await this.assertSolutionSlugIsUnique(props.name)
        }

        await this.repository.updateSolutionBySlug({
            slug,
            modifiedById: currentUserId,
            modifiedDate: new Date(),
            ...props
        })
    }

    /**
     * Initialize a newly created Solution with mandatory personnel and role capabilities.
     * This private method creates a Person entity for the solution creator with both
     * Product Owner and Implementation Owner capabilities enabled for endorsements.
     *
     * @param params The parameters for initializing roles and personnel
     * @param params.solutionId - The ID of the newly created solution
     * @param params.organizationId - The ID of the organization
     * @param params.createdById - The ID of the user creating the solution (current user)
     * @param params.creationDate - The creation date
     */
    private async initializeSolutionRolesAndPersonnel({ solutionId, organizationId, createdById, creationDate }: {
        solutionId: string
        organizationId: string
        createdById: string
        creationDate: Date
    }): Promise<void> {
        // Get the current user (solution creator) information
        const currentUser = await this.appUserInteractor.getUserById({ id: createdById, organizationId }),
            // Create Person entity for the solution creator with both role capabilities
            solutionCreatorPersonData = req.Person.parse({
                id: uuid7(),
                name: currentUser.name,
                description: `Solution Creator with Product Owner and Implementation Owner capabilities: ${currentUser.name}`,
                appUser: AppUserReference.parse({
                    id: currentUser.id,
                    name: currentUser.name
                }),
                stakeholders: [], // Initialize as empty array - can be populated later
                // Enable both Product Owner and Implementation Owner capabilities
                isProductOwner: true,
                isImplementationOwner: true,
                // Grant all endorsement permissions
                canEndorseProjectRequirements: true,
                canEndorseEnvironmentRequirements: true,
                canEndorseGoalsRequirements: true,
                canEndorseSystemRequirements: true,
                solution: {
                    id: solutionId,
                    name: ''
                },
                workflowState: WorkflowState.Active,
                createdBy: AppUserReference.parse({
                    id: currentUser.id,
                    name: currentUser.name
                }),
                creationDate,
                isDeleted: false,
                lastModified: creationDate,
                modifiedBy: AppUserReference.parse({
                    id: currentUser.id,
                    name: currentUser.name
                })
            })

        await this.requirementRepository!.add({
            reqProps: solutionCreatorPersonData,
            createdById,
            creationDate
        })

        // Create default Context and Objective requirement (singleton, minimum requirement)
        // This provides a starting point for defining the solution's purpose and scope
        const defaultContextAndObjective = req.ContextAndObjective.parse({
            id: uuid7(),
            name: 'Context And Objective',
            description: dedent(`
                Define the high-level organizational context and reason for building this system.

                This should include the business problem or opportunity being addressed.
            `),
            solution: {
                id: solutionId,
                name: ''
            },
            workflowState: WorkflowState.Proposed,
            createdBy: AppUserReference.parse({
                id: currentUser.id,
                name: currentUser.name
            }),
            creationDate,
            isDeleted: false,
            lastModified: creationDate,
            modifiedBy: AppUserReference.parse({
                id: currentUser.id,
                name: currentUser.name
            })
        })

        await this.requirementRepository!.add({
            reqProps: defaultContextAndObjective,
            createdById,
            creationDate
        })
    }
}
