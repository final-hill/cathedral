import { Assumption, Constraint, Effect, EnvironmentComponent, FunctionalBehavior, GlossaryTerm, Invariant, Justification, Limit, MoscowPriority, NonFunctionalBehavior, Obstacle, Organization, Outcome, ParsedRequirement, Person, ReqType, Requirement, Solution, Stakeholder, StakeholderCategory, StakeholderSegmentation, SystemComponent, UseCase, UserStory } from "~/domain/requirements";
import { QueryOrder, type ChangeSetType, type EntityManager } from "@mikro-orm/core";
import { AppUserOrganizationRole, AppRole, AppUser, AuditLog } from "~/domain/application";
import { Belongs } from "~/domain/relations/Belongs.js";
import { validate } from 'uuid'
import { Follows } from "~/domain/relations";
import groupBy from "~/shared/groupBy";
import type NaturalLanguageToRequirementService from "~/server/data/services/NaturalLanguageToRequirementService";
import slugify from "~/shared/slugify";

type OrganizationInteractorConstructor = {
    entityManager: EntityManager,
    userId: AppUser['id'],
    organizationId?: Organization['id'],
    organizationSlug?: Organization['slug']
}

/**
 * The OrganizationInteractor class contains the business logic for interacting with an organization.
 *
 * An Interactor is a class that contains the business logic of an application.
 * It has the Single Responsibility (SRP) of interacting with a particular entity.
 * @see https://softwareengineering.stackexchange.com/a/364727/420292
 */
export class OrganizationInteractor {
    private readonly _entityManager: EntityManager
    private readonly _user: Promise<AppUser>
    /** This is not readonly because it can be reassigned in {@link #deleteOrganization} */
    private _organization?: Promise<Organization>

    /**
     * Create a new OrganizationInteractor
     *
     * @param props.entityManager - The entity manager to use
     * @param props.userId - The id of the user to utilize
     * @param [props.organizationId] - The id of the organization to utilize
     * @param [props.organizationSlug] - The slug of the organization to utilize
     */
    constructor(props: OrganizationInteractorConstructor) {
        this._entityManager = props.entityManager

        const em = this.getEntityManager(),
            { userId, organizationId, organizationSlug } = props

        this._user = em.findOneOrFail(AppUser, userId)
        this._organization = organizationId ? em.findOneOrFail(Organization, organizationId) :
            organizationSlug ? em.findOneOrFail(Organization, { slug: organizationSlug }) :
                undefined
    }

    /**
     * Gets the next requirement id for the given solution and requirement type
     *
     * @param prefix - The prefix for the requirement id. Ex: 'P.1.'
     */
    private async _getNextReqId<R extends typeof Requirement>(solution: Solution, prefix: R['reqIdPrefix']): Promise<InstanceType<R>['reqId']> {
        const em = this.getEntityManager(),
            entityCount = await em.count(Belongs, {
                left: { reqId: { $like: `${prefix}%` } },
                right: solution
            })

        return `${prefix}${entityCount + 1}`
    }

    /**
     * Create a new entity manager fork
     * @returns The entity manager
     */
    // TODO: this will likely be moved into a Repository class in the future
    getEntityManager(): EntityManager {
        return this._entityManager.fork();
    }

    /**
     * Add a new requirement to a solution and assign it a new requirement id
     *
     * @param props.solutionId - The id of the solution to add the requirement to
     * @param props.ReqClass - The Constructor of the requirement to add
     * @param props.reqProps - The requirement data to add
     * @returns The id of the new requirement
     * @throws {Error} If the solution does not exist
     * @throws {Error} If the solution does not belong to the organization
     * @throws {Error} If the user is not a reader of the organization or better
     * @throws {Error} If the user is not a contributor of the solution or better
     * @throws {Error} If a referenced requirement does not belong to the solution
     */
    async addRequirement<RCons extends typeof Requirement>({
        solutionId, ReqClass, reqProps
    }: {
        solutionId: Solution['id'],
        ReqClass: RCons,
        reqProps: Omit<ConstructorParameters<RCons>[0], 'reqId' | 'lastModified' | 'modifiedBy' | 'createdBy'>
    }): Promise<InstanceType<RCons>> {
        if (!this.isOrganizationContributor())
            throw new Error('Forbidden: You do not have permission to perform this action')

        const em = this.getEntityManager(),
            appUser = await this._user,
            { left: solution } = await em.findOneOrFail(Belongs, {
                left: { id: solutionId, req_type: ReqType.SOLUTION },
                right: await this._organization
            }) as unknown as { left: Solution },
            // If the entity is silent, do not assign a reqId
            reqId = reqProps.isSilence ? undefined :
                await this._getNextReqId(solution, ReqClass.reqIdPrefix);

        // if a property is a uuid, assert that it belongs to the solution
        for (const [key, value] of Object.entries(reqProps)) {
            if (validate(value) && !['id', 'createdBy', 'modifiedBy'].includes(key))
                await em.findOneOrFail(Belongs, { left: value, right: solution })
        }

        console.log('reqProps', reqProps)

        const newRequirement = em.create(ReqClass, {
            ...reqProps,
            reqId,
            lastModified: new Date(),
            createdBy: appUser,
            modifiedBy: appUser
        }) as InstanceType<RCons>

        em.create(Belongs, { left: newRequirement, right: solution })

        await em.flush()

        return newRequirement
    }

    /**
     * Delete a requirement by id from the specified solution
     *
     * @param props.id - The id of the requirement to delete
     * @param props.solutionId - The id of the solution that the requirement belongs to
     * @param props.ReqClass - The Constructor of the requirement to delete
     * @throws {Error} If the solution does not exist
     * @throws {Error} If the user is not a contributor of the organization or better
     * @throws {Error} If the requirement does not exist
     * @throws {Error} If the requirement does not belong to the solution
     */
    async deleteRequirement<RCons extends typeof Requirement>(props: {
        id: InstanceType<RCons>['id'],
        solutionId: Solution['id'],
        ReqClass: RCons
    }): Promise<void> {
        if (!this.isOrganizationContributor())
            throw new Error('Forbidden: You do not have permission to perform this action')

        const em = this.getEntityManager(),
            solution = await this.getSolutionById(props.solutionId),
            { left: requirement } = await em.findOneOrFail(Belongs, {
                left: {
                    id: props.id,
                    req_type: props.ReqClass.req_type
                },
                right: solution
            }, { populate: ['left'] }) as unknown as { left: InstanceType<RCons> }

        // TODO: decrement the reqId of all requirements that have a reqId greater than the deleted requirement

        await em.removeAndFlush(requirement)
    }

    /**
     * Get a requirement by id from the specified solution
     *
     * @param props.solutionId The id of the solution that the requirement belongs to
     * @param props.ReqClass The Constructor of the requirement to get
     * @param props.id The id of the requirement to get
     * @returns The requirement
     * @throws {Error} If the solution does not exist
     * @throws {Error} If the user is not a reader of the organization or better
     * @throws {Error} If the requirement does not exist
     * @throws {Error} If the requirement does not belong to the solution
     */
    async getRequirementById<RCons extends typeof Requirement>(props: {
        solutionId: Solution['id'],
        ReqClass: RCons,
        id: InstanceType<RCons>['id']
    }): Promise<InstanceType<RCons>> {
        if (!this.isOrganizationReader())
            throw new Error('Forbidden: You do not have permission to perform this action')

        const em = this.getEntityManager(),
            solution = await this.getSolutionById(props.solutionId),
            { left: requirement } = await em.findOneOrFail(Belongs, {
                left: { id: props.id, req_type: props.ReqClass.req_type },
                right: solution
            }, { populate: ['left'] }) as unknown as { left: InstanceType<RCons> }

        return requirement
    }

    /**
     * Find requirements that match the query parameters for a solution
     *
     * @param props.solutionId - The id of the solution to find the requirements for
     * @param props.ReqClass - The Constructor of the requirement to find
     * @param props.query - The query parameters to filter requirements by
     * @returns The requirements that match the query parameters
     * @throws {Error} If the user is not a reader of the organization or better
     */
    async findRequirements<RCons extends typeof Requirement>(props: {
        solutionId: Solution['id'],
        ReqClass: RCons,
        query: Partial<InstanceType<RCons>>
    }): Promise<InstanceType<RCons>[]> {
        if (!this.isOrganizationReader())
            throw new Error('Forbidden: You do not have permission to perform this action')

        const em = this.getEntityManager(),
            solution = await this.getSolutionById(props.solutionId),
            requirements = (await em.find(Belongs, {
                left: {
                    req_type: props.ReqClass.req_type,
                    ...props.query
                },
                right: solution
            }, { populate: ['left'] })).map((req) => req.left as InstanceType<RCons>)

        return requirements
    }

    // TODO: allow the re-ordering of requirements in a solution (reqIds)

    /**
     * Update a requirement by id for a solution with the given properties
     *
     * @param props.id The id of the requirement to update
     * @param props.solutionId The id of the solution that the requirement belongs to
     * @param props.ReqClass The Constructor of the requirement to update
     * @param props.reqProps The properties to update
     * @throws {Error} If the user is not a contributor of the organization or better
     * @throws {Error} If the requirement does not exist
     * @throws {Error} If the solution does not exist
     * @throws {Error} If the requirement is not owned by the solution
     * @throws {Error} If a referenced requirement does not belong to the solution
     */
    async updateRequirement<RCons extends typeof Requirement>(props: {
        id: InstanceType<RCons>['id'],
        solutionId: Solution['id'],
        ReqClass: RCons,
        reqProps: Partial<Omit<InstanceType<RCons>, 'reqId' | 'lastModified' | 'modifiedBy' | 'createdBy'>>
    }): Promise<void> {
        if (!this.isOrganizationContributor())
            throw new Error('Forbidden: You do not have permission to perform this action')

        const em = this.getEntityManager(),
            solution = await this.getSolutionById(props.solutionId),
            { left: requirement } = await em.findOneOrFail(Belongs, {
                left: props.id, right: solution
            }, { populate: ['left'] }) as unknown as { left: InstanceType<RCons> }

        // if a property is a uuid, assert that it belongs to the solution
        requirement.assign({
            ...props.reqProps,
            lastModified: new Date(),
            modifiedBy: await this._user
        } as any) // FIXME: TypeScript (v5.6.3) does not infer the proper type here

        // If the entity is no longer silent and has no reqId, assume
        // that it is a new requirement from the workbox and assign a new reqId
        if (props.reqProps.isSilence !== undefined && props.reqProps.isSilence == false && !requirement.reqId)
            requirement.reqId = await this._getNextReqId(solution, props.ReqClass.reqIdPrefix)

        await em.persistAndFlush(requirement)
    }

    /**
     * Invite an appuser to an organization with a role
     *
     * @param props.email The email of the app user to invite
     * @param props.role The role to assign to the app user
     * @throws {Error} If the user is not an admin of the organization
     * @throws {Error} If the organization does not exist
     * @throws {Error} If the target app user does not exist
     * @throws {Error} If the target app user is already associated with the organization
     */
    async addAppUserToOrganization({ email, role }: { email: string, role: AppRole }): Promise<void> {
        if (!await this.isOrganizationAdmin())
            throw new Error('Forbidden: You do not have permission to perform this action')

        const em = this.getEntityManager(),
            appUser = await em.findOne(AppUser, { email }),
            organization = await this._organization

        if (!appUser)
            throw new Error('Not Found: The app user with the given email does not exist.')

        if (!organization)
            throw new Error('Not Found: The organization does not exist.')

        const existingOrgAppUserRole = await em.findOne(AppUserOrganizationRole, {
            appUser,
            organization
        })

        if (existingOrgAppUserRole)
            throw new Error('Conflict: The app user is already associated with the organization.')

        em.create(AppUserOrganizationRole, { appUser, organization, role })

        await em.flush()
    }

    /**
     * Get an app user by id
     *
     * @param id The id of the app user to get
     * @returns The app user
     * @throws {Error} If the app user does not exist
     * @throws {Error} If the user is not a reader of the organization or better
     * @throws {Error} If the user is trying to get an app user that is not in the same organization
     */
    async getAppUserById(id: AppUser['id']): Promise<AppUser> {
        const organization = await this._organization,
            em = this.getEntityManager(),
            { appUser, role } = (await em.findOneOrFail(AppUserOrganizationRole, {
                appUser: id,
                organization
            }, { populate: ['appUser'] }))

        appUser.role = role

        if (!appUser)
            throw new Error('Not Found: AppUser not found for the given ID.')

        if (!this.isOrganizationReader())
            throw new Error('Forbidden: You do not have permission to perform this action')

        return appUser
    }

    /**
     * Delete an app user from an organization
     *
     * @throws {Error} If the user is not an admin of the organization unless the user is deleting themselves
     * @throws {Error} If the user is deleting the last admin of the organization
     */
    async deleteAppUser(id: AppUser['id']): Promise<unknown> {
        const em = this.getEntityManager(),
            organization = await this._organization,
            appUser = await this._user,
            [targetAppUserRole, orgAdminCount] = await Promise.all([
                em.findOne(AppUserOrganizationRole, {
                    appUser: id,
                    organization
                }, { populate: ['appUser'] }),
                em.count(AppUserOrganizationRole, {
                    organization,
                    role: AppRole.ORGANIZATION_ADMIN
                })
            ])

        if (!targetAppUserRole)
            throw new Error('Not Found: AppUser not found for the given ID and organization.')

        if (targetAppUserRole.role === AppRole.ORGANIZATION_ADMIN && orgAdminCount === 1)
            throw new Error('Forbidden: You cannot delete the last organization admin.')

        if (!this.isOrganizationAdmin() && targetAppUserRole.appUser.id !== appUser.id)
            throw new Error('Forbidden: You do not have permission to perform this action')

        return await em.removeAndFlush(targetAppUserRole)
    }

    /**
     * Update an app user by id in a given organization to have a new role
     *
     * @param id The id of the app user to update
     * @param role The new role to assign to the app user
     * @throws {Error} If the user is not an admin of the organization
     * @throws {Error} If the app user does not exist
     * @throws {Error} If the app user is not in the same organization
     * @throws {Error} If the app user is the last admin of the organization and the new role is not an admin
     * @throws {Error} If the app user is trying to update themselves to a role that is not an admin
     */
    async updateAppUserRole(id: AppUser['id'], role: AppRole): Promise<void> {
        const em = this.getEntityManager(),
            organization = await this._organization,
            appUser = await this._user,
            [targetAppUserRole, orgAdminCount] = await Promise.all([
                em.findOne(AppUserOrganizationRole, {
                    appUser: id,
                    organization
                }, { populate: ['appUser'] }),
                em.count(AppUserOrganizationRole, {
                    organization,
                    role: AppRole.ORGANIZATION_ADMIN
                })
            ])

        if (!targetAppUserRole)
            throw new Error('Not Found: AppUser not found for the given ID and organization.')

        if (targetAppUserRole.role === AppRole.ORGANIZATION_ADMIN && orgAdminCount === 1
            && role !== AppRole.ORGANIZATION_ADMIN)
            throw new Error('Forbidden: You cannot remove the last organization admin.')

        if (!this.isOrganizationAdmin() && targetAppUserRole.appUser.id !== appUser.id)
            throw new Error('Forbidden: You do not have permission to perform this action')

        if (targetAppUserRole.appUser.id === appUser.id && role !== AppRole.ORGANIZATION_ADMIN)
            throw new Error('Forbidden: You cannot remove your own admin role.')

        targetAppUserRole.role = role

        await em.persistAndFlush(targetAppUserRole)
    }

    /**
     * Get all app users for the organization with their associated roles
     *
     * @returns The app users with their associated roles
     * @throws {Error} If the user is not a reader of the organization or better
     */
    async getOrganizationAppUsers(): Promise<AppUser[]> {
        if (!this.isOrganizationReader())
            throw new Error('Forbidden: You do not have permission to perform this action')

        const em = this.getEntityManager(),
            organization = await this._organization,
            appUserOrganizationRoles = await em.findAll(AppUserOrganizationRole, {
                where: { organization },
                populate: ['appUser']
            })

        // assign the roles to the appusers
        const appUsersWithRoles: AppUser[] = appUserOrganizationRoles.map((aur) => {
            const appUser = aur.appUser as AppUser
            appUser.role = aur.role
            return appUser
        })

        return appUsersWithRoles
    }

    /**
     * Check if the current user is an admin of the organization or a system admin
     */
    async isOrganizationAdmin(): Promise<boolean> {
        const appUser = await this._user,
            organization = await this._organization

        if (appUser.isSystemAdmin) return true

        const em = this.getEntityManager(),
            auor = await em.findOne(AppUserOrganizationRole, { appUser, organization }),
            isOrgAdmin = auor?.role ?
                [AppRole.ORGANIZATION_ADMIN].includes(auor.role)
                : false

        return isOrgAdmin
    }

    /**
     * Check if the current user is a contributor of the organization or a system admin
     */
    async isOrganizationContributor(): Promise<boolean> {
        const appUser = await this._user,
            organization = await this._organization

        if (appUser.isSystemAdmin) return true

        const em = this.getEntityManager(),
            auor = await em.findOne(AppUserOrganizationRole, { appUser, organization }),
            isOrgContributor = auor?.role ?
                [AppRole.ORGANIZATION_ADMIN, AppRole.ORGANIZATION_CONTRIBUTOR].includes(auor.role)
                : false

        return isOrgContributor
    }

    /**
     * Check if the current user is a reader of the organization or a system admin
     */
    async isOrganizationReader(): Promise<boolean> {
        const organization = await this._organization,
            appUser = await this._user

        if (appUser.isSystemAdmin) return true

        const em = this.getEntityManager(),
            auor = await em.findOne(AppUserOrganizationRole, { appUser, organization }),
            isOrgReader = auor?.role ?
                [AppRole.ORGANIZATION_ADMIN, AppRole.ORGANIZATION_CONTRIBUTOR, AppRole.ORGANIZATION_READER].includes(auor.role)
                : false

        return isOrgReader
    }

    /**
     * Creates a new organization in the database and sets the creator as an admin
     *
     * @param props The properties of the organization
     * @returns The new organization
     */
    async addOrganization(props: Pick<Organization, 'name' | 'description'>): Promise<Organization> {
        const em = this.getEntityManager(),
            appUser = await this._user,
            newOrganization = em.create(Organization, {
                name: props.name,
                description: props.description,
                createdBy: appUser,
                modifiedBy: appUser,
                lastModified: new Date(),
                isSilence: false,
                reqId: undefined
            })

        em.create(AppUserOrganizationRole, {
            appUser: await this._user,
            organization: newOrganization,
            role: AppRole.ORGANIZATION_ADMIN
        })

        await em.flush()

        return newOrganization
    }

    /**
     * Add a solution to an organization
     *
     * @param props The properties of the solution
     * @returns The new solution
     * @throws {Error} If the user is not an admin of the organization
     * @throws {Error} If the organization does not exist
     */
    async addSolution({ name, description }: Pick<Solution, 'name' | 'description'>): Promise<Solution> {
        const organization = await this._organization,
            createdBy = await this._user

        if (!organization)
            throw new Error('Not Found: The organization does not exist.')

        if (!await this.isOrganizationAdmin())
            throw new Error('Forbidden: You do not have permission to perform this action')

        const em = this.getEntityManager(),
            newSolution = em.create(Solution, {
                name,
                description,
                lastModified: new Date(),
                createdBy,
                modifiedBy: createdBy,
                isSilence: false
            });

        em.create(Belongs, { left: newSolution, right: organization })

        await em.flush()

        await this.addRequirement({
            solutionId: newSolution.id,
            ReqClass: Outcome,
            reqProps: { name: 'G.1', description: 'Context and Objective', isSilence: false }
        })

        await this.addRequirement({
            solutionId: newSolution.id,
            ReqClass: Obstacle,
            reqProps: { name: 'G.2', description: 'Situation', isSilence: false }
        })

        return newSolution
    }

    /**
     * Find solutions that match the query parameters for an organization
     *
     * @param query The query parameters to filter solutions by
     * @returns The solutions that match the query parameters
     * @throws {Error} If the user is not a reader of the organization or better
     * @throws {Error} If the organization does not exist
     */
    async findSolutions(query: Partial<Solution> = {}): Promise<Solution[]> {
        const organization = await this._organization

        if (!organization)
            throw new Error('Not Found: The organization does not exist.')

        if (!await this.isOrganizationReader())
            throw new Error('Forbidden: You do not have permission to perform this action')

        const em = this.getEntityManager(),
            solutions = (await em.find(Belongs, {
                left: {
                    req_type: ReqType.SOLUTION,
                    // remove null entries from the query
                    ...Object.entries(query).reduce((acc, [key, value]) => {
                        if (value != null && value != undefined) acc[key] = value
                        return acc
                    }, {} as Record<string, any>)
                },
                right: { id: organization.id }
            }, { populate: ['left'] })).map((sol) => sol.left as Solution)

        if (solutions.length === 0)
            return []

        return solutions
    }

    /**
     * Get a solution by id
     *
     * @param solutionId The id of the solution to get
     * @returns The solution
     * @throws {Error} If the user is not a reader of the organization or better
     * @throws {Error} If the solution does not exist
     * @throws {Error} If the solution does not belong to the organization
     */
    async getSolutionById(solutionId: Solution['id']): Promise<Solution> {
        if (!await this.isOrganizationReader())
            throw new Error('Forbidden: You do not have permission to perform this action')

        const em = this.getEntityManager(),
            { left: solution } = await em.findOneOrFail(Belongs, {
                left: { id: solutionId, req_type: ReqType.SOLUTION },
                right: await this._organization
            }, { populate: ['left'] }) as unknown as { left: Solution }

        return solution
    }

    /**
     * Get a solution by slug
     *
     * @param slug The slug of the solution to get
     * @returns The solution
     * @throws {Error} If the user is not a reader of the organization or better
     * @throws {Error} If the solution does not exist
     * @throws {Error} If the solution does not belong to the organization
     */
    async getSolutionBySlug(slug: Solution['slug']): Promise<Solution> {
        if (!await this.isOrganizationReader())
            throw new Error('Forbidden: You do not have permission to perform this action')

        const em = this.getEntityManager(),
            { left: solution } = await em.findOneOrFail(Belongs, {
                left: { slug, req_type: ReqType.SOLUTION } as Solution,
                right: await this._organization
            }, { populate: ['left'] }) as unknown as { left: Solution }

        return solution
    }

    /**
     * Delete a solution by slug from an organization
     *
     * @param slug The id of the solution to delete
     * @throws {Error} If the user is not an admin of the organization
     * @throws {Error} If the solution does not exist
     * @throws {Error} If the solution does not belong to the organization
     */
    async deleteSolutionBySlug(slug: Solution['slug']): Promise<void> {
        if (!await this.isOrganizationAdmin())
            throw new Error('Forbidden: You do not have permission to perform this action')

        const em = this.getEntityManager(),
            { left: solution } = await em.findOneOrFail(Belongs, {
                left: { slug, req_type: ReqType.SOLUTION } as Solution,
                right: await this._organization
            }) as unknown as { left: Solution }

        await em.removeAndFlush(solution)
    }

    /**
     * Update a solution by slug with the given properties
     *
     * @param slug The slug of the solution to update
     * @param props The properties to update
     * @throws {Error} If the user is not a contributor of the organization or better
     * @throws {Error} If the solution does not exist
     * @throws {Error} If the solution does not belong to the organization
     */
    async updateSolutionBySlug(slug: Solution['slug'], props: Pick<Partial<Solution>, 'name' | 'description'>): Promise<void> {
        if (!await this.isOrganizationContributor())
            throw new Error('Forbidden: You do not have permission to perform this action')

        const em = this.getEntityManager(),
            { left: solution } = await em.findOneOrFail(Belongs, {
                left: { slug, req_type: ReqType.SOLUTION } as Solution,
                right: await this._organization
            }) as unknown as { left: Solution }

        solution.assign({
            name: props.name ?? solution.name,
            slug: props.name ? slugify(props.name) : solution.slug,
            description: props.description ?? solution.description,
            modifiedBy: await this._user,
            lastModified: new Date()
        })

        await em.persistAndFlush(solution)
    }

    /**
     * Get all organizations that the current user is associated with filtered by the query parameters
     *
     * @param query The query parameters to filter organizations by
     */
    async getUserOrganizations(query: Partial<Organization> = {}): Promise<Organization[]> {
        const em = this.getEntityManager(),
            appUser = await this._user

        // If the user is a system admin, return all organizations
        // filtered by the query parameters
        if (appUser.isSystemAdmin) {
            return em.findAll(Organization, {
                where: Object.entries(query).reduce((acc, [key, value]) => {
                    if (value) acc[key] = value
                    return acc
                }, {} as Record<string, any>)
            })
        }

        // If the user is not a system admin, return only organizations
        // that the user is associated with filtered by the query parameters
        return (await em.findAll(AppUserOrganizationRole, {
            where: {
                appUser,
                organization: Object.entries(query).reduce((acc, [key, value]) => {
                    if (value) acc[key] = value
                    return acc
                }, {} as Record<string, any>)
            },
            populate: ['organization']
        })).map((auor) => auor.organization)
    }

    /**
     * Returns the organization that the user is associated with
     *
     * @returns The organization
     * @throws {Error} If the user is not associated with an organization
     */
    async getOrganization(): Promise<Organization> {
        if (!this._organization)
            throw new Error('Not Found: The organization does not exist.')
        return await this._organization
    }

    /**
     * Delete the organization
     *
     * @throws {Error} If the user is not an admin of the organization or better
     * @throws {Error} If the organization does not exist
     */
    async deleteOrganization(): Promise<void> {
        const em = this.getEntityManager(),
            organization = await this._organization

        if (!organization)
            throw new Error('Not Found: The organization does not exist.')

        if (!await this.isOrganizationAdmin())
            throw new Error('Forbidden: You do not have permission to perform this action')

        // Remove all roles associated with the organization
        const appUserOrganizationRoles = await em.findAll(AppUserOrganizationRole, {
            where: { organization }
        })

        for (const auor of appUserOrganizationRoles)
            em.remove(auor)

        await em.removeAndFlush(organization)

        this._organization = undefined
    }

    /**
     * Update the organization with the given properties.
     *
     * @param props The properties to update
     * @throws {Error} If the user is not a contributor of the organization or better
     * @throws {Error} If the organization does not exist
     */
    async updateOrganization(props: Pick<Partial<Organization>, 'name' | 'description'>): Promise<void> {
        const em = this.getEntityManager(),
            organization = await this._organization

        if (!organization)
            throw new Error('Not Found: The organization does not exist.')

        if (!await this.isOrganizationContributor())
            throw new Error('Forbidden: You do not have permission to perform this action')

        organization.assign({
            name: props.name ?? organization.name,
            description: props.description ?? organization.description,
            slug: props.name ? slugify(props.name) : organization.slug,
            modifiedBy: await this._user,
            lastModified: new Date()
        })

        await em.persistAndFlush(organization)
    }

    /**
     * Get the audit log history for a specific entity
     *
     * @param entityId The id of the entity to get the audit log history for
     * @returns The audit log history
     * @throws {Error} If the user is not a reader of the organization or better
     */
    async getAuditLogHistory(entityId: Requirement['id']): Promise<AuditLog[]> {
        if (!await this.isOrganizationReader())
            throw new Error('Forbidden: You do not have permission to perform this action')

        // FIXME: check the that the AuditLog entity belongs to the organization
        // This is probably not necessary since the Audit Log is going away:
        // https://github.com/final-hill/cathedral/issues/435

        const em = this.getEntityManager()

        return await em.findAll(AuditLog, {
            where: { entityId },
            orderBy: { createdAt: QueryOrder.DESC }
        })
    }

    /**
     * Returns from the audit history all the deleted entities
     * ordered by the date and time when they were deleted in descending order.
     *
     * @param entityName The name of the entity to get the audit log delete history for
     * @returns The audit log delete history
     * @throws {Error} If the user is not a reader of the organization or better
     */
    async getAuditLogDeleteHistory(entityName: string): Promise<unknown> {
        type RowType = {
            id: string,
            type: ChangeSetType,
            created_at: string,
            entity_id: string,
            entity_name: string,
            entity: string
        }

        const conn = this._entityManager.getConnection(),
            res: RowType[] = await conn.execute(`
                SELECT d.id, d.type, d.created_at, a.entity_id, a.entity_name, a.entity
                FROM audit_log AS d
                JOIN audit_log AS a
                    ON a.entity_id = d.entity_id
                    AND a.created_at = (
                        SELECT MAX(a2.created_at)
                        FROM audit_log AS a2
                        WHERE a2.entity_id = d.entity_id
                        AND a2.type IN ('create', 'update')
                        AND a2.created_at < d.created_at
                    )
                WHERE d.type = 'delete'
                AND a.entity_name = ?;
        `, [entityName]),
            auditLogs = res.map((row) => new AuditLog({
                id: row.id,
                createdAt: new Date(row.created_at),
                type: row.type,
                entityId: row.entity_id,
                entityName: row.entity_name,
                entity: row.entity
            }))

        return auditLogs
    }

    /**
     * Get all unapproved (isSilence) requirements that follow from the specified ParsedRequirement for a Solution
     * @param props.solutionId The id of the solution that the requirement belongs to
     * @param props.id The id of the ParsedRequirement to get the requirements that follow from it
     * @returns The requirements that follow from the specified ParsedRequirement
     * @throws {Error} If the user is not a reader of the organization or better
     * @throws {Error} If the ParsedRequirement does not exist
     * @throws {Error} If the ParsedRequirement does not belong to the solution
     */
    async getFollowingParsedSilenceRequirements({ solutionId, id }: { solutionId: Solution['id'], id: Requirement['id'] }): Promise<Partial<Record<ReqType, Requirement[]>>> {
        if (!this.isOrganizationReader())
            throw new Error('Forbidden: You do not have permission to perform this action')

        const em = this.getEntityManager(),
            solution = await this.getSolutionById(solutionId),
            // Check if the ParsedRequirement belongs to the solution
            { left: parsedRequirement } = (await em.findOneOrFail(Belongs, {
                left: { id: id, req_type: ReqType.PARSED_REQUIREMENT },
                right: solution
            }, { populate: ['left'] })) as { left: ParsedRequirement },
            // Get all unapproved requirements that follow from the specified ParsedRequirement
            requirements = (await em.find(Follows, {
                right: parsedRequirement,
                left: { isSilence: true }
            }, { populate: ['left'] })).map(f => f.left as Requirement),
            // Group the results by the requirement type
            groupedResult = groupBy(requirements, ({ req_type }) => req_type)

        return groupedResult
    }

    /**
     * Return all ParsedRequirements for a Solution.
     * @param solutionId The id of the solution to get the ParsedRequirements for
     * @returns The ParsedRequirements for the Solution
     * @throws {Error} If the user is not a reader of the organization or better
     * @throws {Error} If the Solution does not belong to the organization
     */
    async getParsedRequirements(solutionId: Solution['id']): Promise<ParsedRequirement[]> {
        if (!this.isOrganizationReader())
            throw new Error('Forbidden: You do not have permission to perform this action')

        const em = this.getEntityManager(),
            // Check if the Solution belongs to the organization
            { left: solution } = (await em.findOneOrFail(Belongs, {
                left: { id: solutionId, req_type: ReqType.SOLUTION },
                right: await this._organization
            }, { populate: ['left'] })) as unknown as { left: Solution },
            parsedRequirements = (await em.find(Belongs, {
                left: { req_type: ReqType.PARSED_REQUIREMENT },
                right: solution
            }, { populate: ['left'] })).map((pr) => pr.left as ParsedRequirement)

        return parsedRequirements
    }

    /**
     * Parse requirements from a statement, save the parsed requirements to the database
     *
     * @param props.solutionId The id of the solution to add the requirements to
     * @param props.statement The statement to parse requirements from
     * @param props.parsingService The parsing service to use
     * @returns The number of requirements parsed
     * @throws {Error} If the user is not a contributor of the organization or better
     * @throws {Error} If the Solution does not belong to the organization
     */
    async parseRequirement({ solutionId, statement, parsingService }: {
        solutionId: Solution['id'],
        statement: string,
        // FIXME: This should no be the explicit service but a generic service
        parsingService: NaturalLanguageToRequirementService
    }): Promise<number> {
        if (!this.isOrganizationContributor())
            throw new Error('Forbidden: You do not have permission to perform this action')

        const appUser = await this._user,
            em = this.getEntityManager(),
            { left: solution } = (await em.findOneOrFail(Belongs, {
                left: { id: solutionId, req_type: ReqType.SOLUTION },
                right: await this._organization
            }, { populate: ['left'] })) as unknown as { left: Solution }

        const groupedResult = await parsingService.parse(statement)

        const parsedRequirement = em.create(ParsedRequirement, {
            name: '{LLM Parsed Requirement}',
            description: statement,
            createdBy: appUser,
            modifiedBy: appUser,
            lastModified: new Date(),
            isSilence: true
        })

        em.create(Belongs, { left: parsedRequirement, right: solution });

        // FIXME: need a better type than 'any'
        const addSolReq = (ReqClass: typeof Requirement, props: any) => {
            const req = em.create(ReqClass, {
                ...props,
                isSilence: true,
                lastModified: new Date(),
                modifiedBy: appUser,
                createdBy: appUser
            })

            em.create(Belongs, { left: req, right: solution });

            return req
        }

        // FIXME: need a better type than 'any'
        const addParsedReq = (ReqClass: typeof Requirement, props: any) => {
            const req = addSolReq(ReqClass, props)
            em.create(Follows, { left: req, right: parsedRequirement });
            return req
        };

        groupedResult.Assumption?.forEach((item) => addParsedReq(Assumption, item));
        groupedResult.Constraint?.forEach((item) => addParsedReq(Constraint, item));
        groupedResult.Effect?.forEach((item) => addParsedReq(Effect, item));
        groupedResult.EnvironmentComponent?.forEach((item) => addParsedReq(EnvironmentComponent, item));
        groupedResult.FunctionalBehavior?.forEach((item) => addParsedReq(FunctionalBehavior, item));
        groupedResult.GlossaryTerm?.forEach((item) => addParsedReq(GlossaryTerm, item));
        groupedResult.Invariant?.forEach((item) => addParsedReq(Invariant, item));
        groupedResult.Justification?.forEach((item) => addParsedReq(Justification, item));
        groupedResult.Limit?.forEach((item) => addParsedReq(Limit, item));
        groupedResult.NonFunctionalBehavior?.forEach((item) => addParsedReq(NonFunctionalBehavior, item));
        groupedResult.Obstacle?.forEach((item) => addParsedReq(Obstacle, item));
        groupedResult.Outcome?.forEach((item) => addParsedReq(Outcome, item));
        groupedResult.Person?.forEach((item) => addParsedReq(Person, item));
        groupedResult.Stakeholder?.forEach((item) => addParsedReq(Stakeholder, item));
        groupedResult.SystemComponent?.forEach((item) => addParsedReq(SystemComponent, item));
        groupedResult.UseCase?.forEach((item) => {
            addParsedReq(UseCase, {
                extensions: item.extensions,
                outcome: addSolReq(Outcome, {
                    name: item.name,
                    description: item.outcome
                }),
                level: item.level,
                mainSuccessScenario: item.mainSuccessScenario,
                scope: item.scope,
                name: item.name,
                description: '',
                priority: item.moscowPriority as MoscowPriority ?? MoscowPriority.MUST,
                // triggerId: undefined,
                precondition: addSolReq(Assumption, {
                    name: item.name,
                    description: item.precondition
                }),
                successGuarantee: addSolReq(Effect, {
                    name: item.name,
                    description: item.successGuarantee
                }),
                primaryActor: addSolReq(Stakeholder, {
                    name: item.primaryActor,
                    availability: 50,
                    influence: 50,
                    description: '',
                    category: StakeholderCategory.KEY_STAKEHOLDER,
                    segmentation: StakeholderSegmentation.VENDOR,
                })
            })
        });
        (groupedResult.UserStory ?? []).forEach((item) => {
            addParsedReq(UserStory, {
                priority: item.moscowPriority as MoscowPriority ?? MoscowPriority.MUST,
                name: item.name,
                description: '',
                functionalBehavior: addSolReq(FunctionalBehavior, {
                    priority: item.moscowPriority as MoscowPriority ?? MoscowPriority.MUST,
                    name: item.functionalBehavior,
                    description: item.functionalBehavior
                }),
                outcome: addSolReq(Outcome, {
                    name: item.outcome,
                    description: item.outcome
                }),
                primaryActor: addSolReq(Stakeholder, {
                    name: item.role,
                    availability: 50,
                    influence: 50,
                    description: '',
                    category: StakeholderCategory.KEY_STAKEHOLDER,
                    segmentation: StakeholderSegmentation.VENDOR
                })
            })
        });

        await em.flush()

        const reqCount = Object.values(groupedResult).reduce((acc, val) => acc + val.length, 0)

        return reqCount
    }
}