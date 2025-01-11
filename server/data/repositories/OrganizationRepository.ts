import { Collection, MikroORM, type Options } from "@mikro-orm/postgresql";
import { AppUser, AppUserOrganizationRole } from "~/domain/application";
import { Organization, Requirement, Solution } from "~/domain/requirements";
import { AppUserModel, AppUserOrganizationRoleModel, AppUserOrganizationRoleVersionsModel, AppUserVersionsModel } from "../models/application";
import * as reqModels from "../models/requirements";
import { BelongsModel, BelongsVersionsModel } from "../models/relations";
import { RelType } from "../models/relations/RelType";
import { camelCaseToSnakeCase, pascalCaseToSnakeCase, slugify, snakeCaseToCamelCase } from "#shared/utils";
import { ReqType } from "../models/requirements/ReqType";
import { v7 as uuid7 } from 'uuid'

export type OrganizationRepositoryOptions = {
    config: Options,
    organizationId?: Organization['id'],
    organizationSlug?: Organization['slug']
}

export type CreationInfo = {
    createdById: AppUser['id']
    effectiveDate: Date
}

export class OrganizationRepository {
    private _orm

    private _organizationId?: Organization['id']
    private _organizationSlug?: Organization['slug']
    /** This is not readonly because it can be reassigned in {@link #deleteOrganization} */
    private _organization: Promise<Organization>

    /**
     * Constructs a new OrganizationRepository instance
     *
     * @param props - The properties to utilize
     * @param props.config - The MikroORM configuration to utilize
     * @param [props.organizationId] - The id of the organization to utilize
     * @param [props.organizationSlug] - The slug of the organization to utilize
     */
    constructor(options: OrganizationRepositoryOptions) {
        const { config, organizationId, organizationSlug } = options

        this._organizationId = organizationId
        this._organizationSlug = organizationSlug
        this._orm = MikroORM.initSync(config)
        this._organization = this._getOrganization()
    }

    /**
     * Returns new EntityManager instance with its own identity map
     */
    private _fork() { return this._orm.em.fork() }

    /**
     * Associates an app user with the organization with the specified role
     * @param auor.appUserId - The id of the app user
     * @param auor.organizationId - The id of the organization
     * @param auor.role - The role of the app user in the organization
     */
    async addAppUserOrganizationRole(auor: Pick<AppUserOrganizationRole, 'appUserId' | 'organizationId' | 'role'> & { effectiveDate: Date }): Promise<void> {
        const em = this._fork()

        em.create(AppUserOrganizationRoleVersionsModel, {
            appUserOrganizationRole: em.create(AppUserOrganizationRoleModel, {
                appUser: auor.appUserId,
                organization: auor.organizationId
            }),
            role: auor.role,
            isDeleted: false,
            effectiveFrom: auor.effectiveDate
        })

        await em.flush()
    }

    /**
     * Adds a new organization
     * @param props.name - The name of the organization
     * @param props.description - The description of the organization
     * @param props.userId - The id of the user creating the organization
     * @param props.effectiveDate - The effective date of the organization
     * @throws {Error} If the organization already exists
     */
    async addOrganization({ name, description, createdById, effectiveDate }: Pick<Organization, 'name' | 'description'> & CreationInfo): Promise<Organization['id']> {
        const em = this._fork(),
            existingOrg = await this.getSolutionBySlug(slugify(name))

        if (existingOrg)
            throw new Error('Organization already exists with the same name')

        const newId = uuid7()

        em.create(reqModels.OrganizationVersionsModel, {
            isDeleted: false,
            effectiveFrom: effectiveDate,
            isSilence: false,
            slug: slugify(name),
            name,
            description,
            modifiedBy: createdById,
            requirement: em.create(reqModels.OrganizationModel, {
                id: newId,
                createdBy: createdById
            })
        })

        await em.flush()

        return newId
    }

    /**
     *
     */
    async addRequirement<RCons extends typeof Requirement>(props: CreationInfo & {
        solutionId: Solution['id'],
        ReqClass: RCons,
        reqProps: Omit<ConstructorParameters<RCons>[0],
            'reqId' | 'lastModified' | 'id' | 'isDeleted' | 'isSilence'
            | 'effectiveFrom' | 'modifiedById' | 'createdById' | 'creationDate'>
    }): Promise<InstanceType<RCons>['id']> {
        const em = this._fork(),
            newId = uuid7()

        const solution = await this.getSolutionById(props.solutionId)

        if (!solution)
            throw new Error('Solution does not exist')

        const newRequirement = em.create<reqModels.RequirementVersionsModel>((reqModels as any)[`${props.ReqClass.name}VersionsModel`], {
            id: newId,
            isDeleted: false,
            effectiveFrom: props.effectiveDate,
            isSilence: false,
            modifiedBy: props.createdById,
            ...props.reqProps,
            requirement: em.create<reqModels.RequirementModel>((reqModels as any)[props.ReqClass.name], {
                id: newId,
                createdBy: props.createdById
            })
        })

        // add the relation between the requirement and the solution (Belongs relation)
        em.create(BelongsVersionsModel, {
            isDeleted: false,
            effectiveFrom: props.effectiveDate,
            requirementRelation: em.create(BelongsModel, {
                left: newId,
                right: props.solutionId
            })
        })

        await em.flush()

        return newId
    }

    /**
     * Adds a new solution to the organization
     * @param props.name - The name of the solution
     * @param props.description - The description of the solution
     * @param props.modifiedById - The id of the user creating the solution
     * @param props.effectiveDate - The effective date of the solution
     */
    async addSolution({ name, description, createdById, effectiveDate }: Pick<Solution, 'name' | 'description'> & CreationInfo): Promise<Solution['id']> {
        const em = this._fork(),
            organization = await this.getOrganization(),
            newId = uuid7()

        em.create(reqModels.SolutionVersionsModel, {
            isDeleted: false,
            effectiveFrom: effectiveDate,
            isSilence: false,
            slug: slugify(name),
            name,
            description,
            modifiedBy: createdById,
            requirement: em.create(reqModels.SolutionModel, {
                id: newId,
                createdBy: createdById
            })
        })

        // add the relation between the solution and the organization (Belongs relation)
        em.create(BelongsVersionsModel, {
            isDeleted: false,
            effectiveFrom: effectiveDate,
            requirementRelation: em.create(BelongsModel, {
                left: newId,
                right: organization.id
            })
        })

        await em.flush()

        return newId
    }

    /**
     * Deletes the organization
     *
     * @throws {Error} If the organization does not exist
     */
    async deleteOrganization(): Promise<void> {
        const em = this._fork(),
            organization = await this.getOrganization()

        em.create(reqModels.OrganizationVersionsModel, {
            isDeleted: true,
            effectiveFrom: new Date(),
            isSilence: false,
            slug: organization.slug,
            name: organization.name,
            description: organization.description,
            modifiedBy: organization.modifiedById,
            requirement: em.create(reqModels.OrganizationModel, {
                id: organization.id,
                createdBy: organization.createdById
            })
        })

        await em.flush()
    }

    /**
     * Find solutions that match the query parameters for an organization
     *
     * @param query The query parameters to filter solutions by
     * @returns The solutions that match the query parameters
     */
    async findSolutions(query: Partial<Solution>): Promise<Solution[]> {
        // Solution is in the 'requirement' table with ReqType.SOLUTION
        const em = this._fork(),
            knex = em.getKnex(),
            organizationId = (await this.getOrganization()).id

        const solutionsQuery = knex
            .select('s.*', 'sv.*')
            .from({ s: 'requirement' })
            .join({ sv: 'requirement_versions' }, function () {
                this.on('s.id', '=', 'sv.requirement_id')
                    .andOn('sv.effective_from', '=', knex.raw(`(SELECT MAX(effective_from)
                        FROM requirement_versions
                        WHERE requirement_id = s.id AND effective_from <= now())`)
                    )
            })
            .join({ rel_sol_org: 'requirement_relation' }, function () {
                this.on('s.id', '=', 'rel_sol_org.left_id')
                    .andOn('rel_sol_org.rel_type', '=', `'${RelType.BELONGS}'`)
                    .andOn('rel_sol_org.right_id', '=', `'${organizationId}'`)
            })
            .join({ rel_sol_org_v: 'requirement_relation_versions' }, function () {
                this.on('rel_sol_org.id', '=', 'rel_sol_org_v.requirement_relation_id')
                    .andOn('rel_sol_org_v.effective_from', '=', knex.raw(`(SELECT MAX(effective_from)
                        FROM requirement_relation_versions
                        WHERE requirement_relation_id = rel_sol_org.id AND effective_from <= now())`)
                    )
            })
            .where('s.req_type', ReqType.SOLUTION);

        const solutionsFiltered = await knex
            .select('*')
            .from(solutionsQuery.as('sols'))
            .where(Object.entries(query).reduce((acc, [key, value]) => ({
                ...acc,
                [`sols.${camelCaseToSnakeCase(key)}`]: value
            }), {}))

        return solutionsFiltered.map((result) => new Solution(
            Object.entries(result).reduce((acc, [key, value]) => ({
                ...acc, [snakeCaseToCamelCase(key)]: value
            }), {} as any))
        )
    }

    /**
     * Find requirements that match the query parameters for a solution
     *
     * @param props.solutionId - The id of the solution to find the requirements for
     * @param props.ReqClass - The Constructor of the requirement to find
     * @param props.query - The query parameters to filter requirements by
     * @returns The requirements that match the query parameters
     * @throws {Error} If the solution does not exist in the organization
     */
    async findSolutionRequirements<RCons extends typeof Requirement>(props: {
        solutionId: Solution['id'],
        ReqClass: RCons,
        query: Partial<InstanceType<RCons>>
    }): Promise<InstanceType<RCons>[]> {
        const em = this._fork(),
            knex = em.getKnex(),
            organizationId = (await this.getOrganization()).id

        const requirementsQuery = knex
            .select('rs.*', 'rv.*')
            .from({ rs: 'requirement' })
            .join({ rv: 'requirement_versions' }, function () {
                this.on('rs.id', '=', 'rv.requirement_id')
                    .andOn('rv.effective_from', '=', knex.raw(`(SELECT MAX(effective_from)
                        FROM requirement_versions
                        WHERE requirement_id = rs.id AND effective_from <= now())`)
                    )
            })
            .join({ rel_req_sol: 'requirement_relation' }, function () {
                this.on('rs.id', '=', 'rel_req_sol.left_id')
                    .andOn('rel_req_sol.rel_type', '=', `'${RelType.BELONGS}'`)
                    .andOn('rel_req_sol.right_id', '=', `'${props.solutionId}'`)
            })
            .join({ rel_req_sol_v: 'requirement_relation_versions' }, function () {
                this.on('rel_req_sol.id', '=', 'rel_req_sol_v.requirement_relation_id')
                    .andOn('rel_req_sol_v.effective_from', '=', knex.raw(`(SELECT MAX(effective_from)
                        FROM requirement_relation_versions
                        WHERE requirement_relation_id = rel_req_sol.id AND effective_from <= now())`)
                    )
            })
            .join({ rel_sol_org: 'requirement_relation' }, function () {
                this.on('rel_req_sol.right_id', '=', 'rel_sol_org.left_id')
                    .andOn('rel_sol_org.rel_type', '=', `'${RelType.BELONGS}'`)
                    .andOn('rel_sol_org.right_id', '=', `'${organizationId}'`)
            })
            .join({ rel_sol_org_v: 'requirement_relation_versions' }, function () {
                this.on('rel_sol_org.id', '=', 'rel_sol_org_v.requirement_relation_id')
                    .andOn('rel_sol_org_v.effective_from', '=', knex.raw(`(SELECT MAX(effective_from)
                        FROM requirement_relation_versions
                        WHERE requirement_relation_id = rel_sol_org.id AND effective_from <= now())`)
                    )
            })
            .where('rs.req_type', pascalCaseToSnakeCase(props.ReqClass.name))

        const requirementsFiltered = await knex
            .select('*')
            .from(requirementsQuery.as('reqs'))
            .where(Object.entries(props.query).reduce((acc, [key, value]) => ({
                ...acc,
                [`reqs.${camelCaseToSnakeCase(key)}`]: value
            }), {}))

        return requirementsFiltered.map((result) => new props.ReqClass(
            Object.entries(result).reduce((acc, [key, value]) => ({
                ...acc, [snakeCaseToCamelCase(key)]: value
            }), {} as any))
        ) as InstanceType<RCons>[]
    }

    /**
     * Returns the AppUserOrganizationRole for the given app user and organization
     * @param props.appUserId - The id of the app user
     * @returns The AppUserOrganizationRole
     * @throws {Error} If the app user organization role does not exist
     */
    async getAppUserOrganizationRole(appUserId: AppUser['id']): Promise<AppUserOrganizationRole> {
        const organizationId = (await this.getOrganization()).id,
            em = this._fork(),
            knex = em.getKnex(),
            results = await knex
                .select({
                    role: 'auorv.role',
                    effectiveFrom: 'auorv.effective_from',
                    isDeleted: 'auorv.is_deleted'
                })
                .from({ auor: 'app_user_organization_role' })
                .join({ auorv: 'app_user_organization_role_versions' }, function () {
                    this.on('auor.id', '=', 'auorv.app_user_organization_role_id')
                        .andOn('auor.app_user_id', '=', `'${appUserId}'`)
                        .andOn('auor.organization_id', '=', `'${organizationId}'`)
                        .andOn('auorv.effective_from', '=', knex.raw(`(SELECT MAX(effective_from)
                            FROM app_user_organization_role_versions
                            WHERE app_user_organization_role_id = auor.id AND effective_from <= now())`)
                        )
                })

        if (results.length === 0)
            throw new Error('App user organization role does not exist')

        const result = results[0]

        return new AppUserOrganizationRole({
            appUserId,
            organizationId,
            role: result.role,
            effectiveFrom: result.effectiveFrom,
            isDeleted: result.isDeleted
        })
    }

    /**
     * Returns all organizations associated with the app user
     * @param appUserId - The id of the app user
     * @returns The organizations associated with the app user
     */
    async getAppUserOrganizations(appUserId: AppUser['id']): Promise<Organization[]> {
        const em = this._fork(),
            knex = em.getKnex(),
            results = await knex
                .select({
                    creationDate: 'rs.creation_date',
                    createdById: 'rs.created_by_id',
                    modifiedById: 'rs.modified_by_id',
                    isDeleted: 'rv.is_deleted',
                    effectiveFrom: 'rv.effective_from',
                    id: 'rs.id',
                    name: 'rv.name',
                    description: 'rv.description',
                    isSilence: 'rv.is_silence',
                    reqId: 'rv.req_id'
                })
                .from({ rs: 'requirement' })
                .join({ rv: 'requirement_versions' }, function () {
                    this.on('rs.id', '=', 'rv.requirement_id')
                        .andOn('rv.effective_from', '=', knex.raw(`(SELECT MAX(effective_from)
                            FROM requirement_versions
                            WHERE requirement_id = rs.id AND effective_from <= now())`)
                        )
                })
                .join({ auor: 'app_user_organization_role' }, 'rs.id', 'auor.organization_id')
                .join({ auorv: 'app_user_organization_role_versions' }, function () {
                    this.on('auor.id', '=', 'auorv.app_user_organization_role_id')
                        .andOn('auor.app_user_id', '=', `'${appUserId}'`)
                        .andOn('auorv.effective_from', '=', knex.raw(`(SELECT MAX(effective_from)
                            FROM app_user_organization_role_versions
                            WHERE app_user_organization_role_id = auor.id AND effective_from <= now())`)
                        )
                })

        return results.map((result) => new Organization(result))

    }

    /**
     * Gets the organization
     * @returns The organization
     */
    async getOrganization(): Promise<Organization> {
        return this._organization
    }

    /**
     * Gets all organizations
     * @returns The organizations
     */
    async getAllOrganizations(): Promise<Organization[]> {
        const em = this._fork(),
            knex = em.getKnex(),
            results = await knex
                .select({
                    creationDate: 'rs.creation_date',
                    createdById: 'rs.created_by_id',
                    modifiedById: 'rs.modified_by_id',
                    isDeleted: 'rv.is_deleted',
                    effectiveFrom: 'rv.effective_from',
                    id: 'rs.id',
                    name: 'rv.name',
                    description: 'rv.description',
                    isSilence: 'rv.is_silence',
                    reqId: 'rv.req_id'
                })
                .from({ rs: 'requirement' })
                .join({ rv: 'requirement_versions' }, function () {
                    this.on('rs.id', '=', 'rv.requirement_id')
                        .andOn('rv.effective_from', '=', knex.raw(`(SELECT MAX(effective_from)
                            FROM requirement_versions
                            WHERE requirement_id = rs.id AND effective_from <= now())`)
                        )
                })
                .where({ 'rs.req_type': ReqType.ORGANIZATION })

        return results.map((result) => new Organization({
            creationDate: result.creationDate,
            isDeleted: result.isDeleted,
            effectiveFrom: result.effectiveFrom,
            id: result.id,
            name: result.name,
            description: result.description,
            isSilence: result.isSilence,
            reqId: result.reqId,
            createdById: result.createdById,
            modifiedById: result.modifiedById,
        }))
    }

    /**
     * Gets an organization by id or slug
     * @returns The organization
     * @throws {Error} If the organization does not exist
     */
    private async _getOrganization(): Promise<Organization> {
        const em = this._fork(),
            knex = em.getKnex(),
            results = await knex
                .select({
                    creationDate: 'rs.creation_date',
                    createdById: 'rs.created_by_id',
                    modifiedById: 'rs.modified_by_id',
                    idSeleted: 'rv.is_deleted',
                    effectiveFrom: 'rv.effective_from',
                    id: 'rs.id',
                    name: 'rv.name',
                    description: 'rv.description',
                    isSilence: 'rv.is_silence',
                    reqId: 'rv.req_id'
                })
                .from({ rs: 'requirement' })
                .join({ rv: 'requirement_versions' }, function () {
                    this.on('rs.id', '=', 'rv.requirement_id')
                        .andOn('rv.effective_from', '=', knex.raw(`(SELECT MAX(effective_from)
                            FROM requirement_versions
                            WHERE requirement_id = rs.id AND effective_from <= now())`)
                        )
                })
                .where({ 'rs.req_type': ReqType.ORGANIZATION })
                .andWhere({
                    ...(this._organizationId ? { 'rs.id': this._organizationId } : {}),
                    ...(this._organizationSlug ? { 'rv.slug': this._organizationSlug } : {})
                })

        if (results.length === 0)
            throw new Error('Organization does not exist')

        const result = results[0]

        return new Organization({
            creationDate: result.creationDate,
            isDeleted: result.is_deleted,
            effectiveFrom: result.effectiveFrom,
            id: result.id,
            name: result.name,
            description: result.description,
            isSilence: result.isSilence,
            reqId: result.reqId,
            createdById: result.createdById,
            modifiedById: result.modifiedById,
        })
    }

    /**
     * Get an organization user by id
     *
     * @param props.id The id of the app user to get
     * @returns The app user
     * @throws {Error} If the organization does not exist
     * @throws {Error} If the app user does not exist in the organization
     */
    async getOrganizationAppUserById(id: AppUser['id']): Promise<AppUser> {
        const em = this._fork(),
            knex = em.getKnex(),
            organizationId = (await this.getOrganization()).id,
            results = await knex
                .select({
                    creationDate: 'su.creation_date',
                    isDeleted: 'suv.is_deleted',
                    effectiveFrom: 'suv.effective_from',
                    email: 'suv.email',
                    id: 'su.id',
                    name: 'suv.name',
                    isSystemAdmin: 'suv.is_system_admin',
                    lastLoginDate: 'suv.last_login_date',
                    role: 'auorv.role'
                })
                .from({ su: 'app_user' })
                .join({ suv: 'app_user_versions' }, function () {
                    this.on('su.id', '=', 'suv.app_user_id')
                        .andOn('suv.effective_from', '=', knex.raw(`(SELECT MAX(effective_from)
                            FROM app_user_versions
                            WHERE app_user_id = su.id AND effective_from <= now())`)
                        )
                })
                .join({ auor: 'app_user_organization_role' }, 'su.id', 'auor.app_user_id')
                .join({ auorv: 'app_user_organization_role_versions' }, function () {
                    this.on('auor.id', '=', 'auorv.app_user_organization_role_id')
                        .andOn('auor.organization_id', '=', `'${organizationId}'`)
                        .andOn('auorv.effective_from', '=', knex.raw(`(SELECT MAX(effective_from)
                            FROM app_user_organization_role_versions
                            WHERE app_user_organization_role_id = auor.id AND effective_from <= now())`)
                        )
                })
                .where('su.id', id)
                .andWhere('suv.is_deleted', false)
                .andWhere('auorv.is_deleted', false)

        if (results.length === 0)
            throw new Error('App user does not exist in the organization')

        const result = results[0]

        return new AppUser({
            creationDate: result.creationDate,
            isDeleted: result.isDeleted,
            effectiveFrom: result.effectiveFrom,
            email: result.email,
            id: result.id,
            name: result.name,
            isSystemAdmin: result.isSystemAdmin,
            lastLoginDate: result.lastLoginDate,
            role: result.role
        })
    }

    /**
     * Gets the next requirement id for the given solution and requirement type
     *
     * @param solutionId - The id of the solution
     * @param prefix - The prefix for the requirement id. Ex: 'P.1.'
     * @returns The next requirement id
     * @throws {Error} If the solution does not exist
     */
    async getNextReqId<R extends typeof Requirement>(solutionId: Solution['id'], prefix: R['reqIdPrefix']): Promise<InstanceType<R>['reqId']> {
        const em = this._fork(),
            knex = em.getKnex(),
            results = await knex
                .count({ count: 'rv.req_id' })
                .from({ rs: 'requirement' })
                .join({ rv: 'requirement_versions' }, function () {
                    this.on('rs.id', '=', 'rv.requirement_id')
                        .andOn('rv.effective_from', '=', knex.raw(`(SELECT MAX(effective_from)
                            FROM requirement_versions
                            WHERE requirement_id = rs.id AND effective_from <= now())`)
                        )
                })
                .join({ rr: 'requirement_relation' }, function () {
                    this.on('rs.id', '=', 'rr.left_id')
                        .andOn('rr.rel_type', '=', `'${RelType.BELONGS}'`)
                })
                .join({ rrv: 'requirement_relation_versions' }, function () {
                    this.on('rr.id', '=', 'rrv.requirement_relation_id')
                        .andOn('rrv.effective_from', '=', knex.raw(`(SELECT MAX(effective_from)
                            FROM requirement_relation_versions
                            WHERE requirement_relation_id = rr.id AND effective_from <= now())`)
                        )
                })
                .andWhere('rr.right_id', solutionId)
                .andWhere('rv.req_id', 'like', `${prefix}%`)
                .groupBy('rv.req_id')

        if (results.length === 0)
            return `${prefix}1`

        // according to the documentation, this should be a string
        // ref: https://knexjs.org/guide/query-builder.html#count
        const result = results[0] as { count: string }

        return `${prefix}${Number(result.count) + 1}`
    }

    /**
     * Gets all AppUsers for the organization
     * @throws {Error} If the organization does not exist
     * @returns The AppUsers for the organization
     */
    async getOrganizationAppUsers(): Promise<AppUser[]> {
        const em = this._fork(),
            organizationId = (await this.getOrganization()).id,
            knex = em.getKnex(),
            results = await knex
                .select({
                    creationDate: 'su.creation_date',
                    isDeleted: 'suv.is_deleted',
                    effectiveFrom: 'suv.effective_from',
                    email: 'suv.email',
                    id: 'su.id',
                    name: 'suv.name',
                    isSystemAdmin: 'suv.is_system_admin',
                    lastLoginDate: 'suv.last_login_date',
                    role: 'auorv.role'
                })
                .from({ su: 'app_user' })
                .join({ suv: 'app_user_versions' }, function () {
                    this.on('su.id', '=', 'suv.app_user_id')
                        .andOn('suv.effective_from', '=', knex.raw(`(SELECT MAX(effective_from)
                            FROM app_user_versions
                            WHERE app_user_id = su.id AND effective_from <= now())`)
                        )
                })
                .join({ auor: 'app_user_organization_role' }, 'su.id', 'auor.app_user_id')
                .join({ auorv: 'app_user_organization_role_versions' }, function () {
                    this.on('auor.id', '=', 'auorv.app_user_organization_role_id')
                        .andOn('auor.organization_id', '=', `'${organizationId}'`)
                        .andOn('auorv.effective_from', '=', knex.raw(`(SELECT MAX(effective_from)
                            FROM app_user_organization_role_versions
                            WHERE app_user_organization_role_id = auor.id AND effective_from <= now())`)
                        )
                })
                .where('suv.is_deleted', false)
                .andWhere('auorv.is_deleted', false)

        return results.map((result) => new AppUser({
            creationDate: result.creationDate,
            isDeleted: result.isDeleted,
            effectiveFrom: result.effectiveFrom,
            email: result.email,
            id: result.id,
            name: result.name,
            isSystemAdmin: result.isSystemAdmin,
            lastLoginDate: result.lastLoginDate,
            role: result.role
        }))
    }

    /**
     * Gets a solution by id belonging to the organization
     * @param solutionId - The id of the solution to get
     * @returns The solution
     * @throws {Error} If the solution does not exist in the organization
     */
    async getSolutionById(solutionId: Solution['id']): Promise<Solution> {
        const em = this._fork(),
            knex = em.getKnex(),
            organizationId = (await this.getOrganization()).id,
            results = await knex
                .select('s.*', 'sv.*')
                .from({ s: 'requirement' })
                .join({ sv: 'requirement_versions' }, function () {
                    this.on('s.id', '=', 'sv.requirement_id')
                        .andOn('sv.effective_from', '=', knex.raw(`(SELECT MAX(effective_from)
                            FROM requirement_versions
                            WHERE requirement_id = s.id AND effective_from <= now())`)
                        )
                })
                // check that the solution belongs to the organization
                .join({ rel_sol_org: 'requirement_relation' }, function () {
                    this.on('s.id', '=', 'rel_sol_org.left_id')
                        .andOn('rel_sol_org.rel_type', '=', `'${RelType.BELONGS}'`)
                        .andOn('rel_sol_org.right_id', '=', `'${organizationId}'`)
                })
                .join({ rel_sol_org_v: 'requirement_relation_versions' }, function () {
                    this.on('rel_sol_org.id', '=', 'rel_sol_org_v.requirement_relation_id')
                        .andOn('rel_sol_org_v.effective_from', '=', knex.raw(`(SELECT MAX(effective_from)
                    FROM requirement_relation_versions
                    WHERE requirement_relation_id = rel_sol_org.id AND effective_from <= now())`)
                        )
                })
                .where('s.id', solutionId)
                .andWhere('s.req_type', ReqType.SOLUTION)

        if (results.length === 0)
            throw new Error('Solution does not exist in the organization')

        const result = results[0]

        return new Solution(
            Object.entries(result).reduce((acc, [key, value]) => ({
                ...acc, [snakeCaseToCamelCase(key)]: value
            }), {} as any)
        )
    }

    /**
     * Gets a solution by slug belonging to the organization
     * @param solutionSlug - The slug of the solution to get
     * @returns The solution
     * @throws {Error} If the solution does not exist in the organization
     * @throws {Error} If the solution does not exist
     */
    async getSolutionBySlug(solutionSlug: Solution['slug']): Promise<Solution> {
        const em = this._fork(),
            knex = em.getKnex(),
            organizationId = (await this.getOrganization()).id,
            results = await knex
                .select('s.*', 'sv.*')
                .from({ s: 'requirement' })
                .join({ sv: 'requirement_versions' }, function () {
                    this.on('s.id', '=', 'sv.requirement_id')
                        .andOn('sv.effective_from', '=', knex.raw(`(SELECT MAX(effective_from)
                            FROM requirement_versions
                            WHERE requirement_id = s.id AND effective_from <= now())`)
                        )
                })
                // check that the requirement is a solution and belongs to the organization
                .join({ rel_sol_org: 'requirement_relation' }, function () {
                    this.on('s.id', '=', 'rel_sol_org.left_id')
                        .andOn('rel_sol_org.rel_type', '=', `'${RelType.BELONGS}'`)
                        .andOn('rel_sol_org.right_id', '=', `'${organizationId}'`)
                })
                .join({ rel_sol_org_v: 'requirement_relation_versions' }, function () {
                    this.on('rel_sol_org.id', '=', 'rel_sol_org_v.requirement_relation_id')
                        .andOn('rel_sol_org_v.effective_from', '=', knex.raw(`(SELECT MAX(effective_from)
                    FROM requirement_relation_versions
                    WHERE requirement_relation_id = rel_sol_org.id AND effective_from <= now())`)
                        )
                })
                .where('sv.slug', solutionSlug)
                .andWhere('s.req_type', ReqType.SOLUTION)

        if (results.length === 0)
            throw new Error('Solution does not exist in the organization')

        const result = results[0]

        return new Solution(
            Object.entries(result).reduce((acc, [key, value]) => ({
                ...acc, [snakeCaseToCamelCase(key)]: value
            }), {} as any)
        )
    }

    /**
     * Gets a requirement by id belonging to the organization solution
     * @param props.id - The id of the requirement to get
     * @param props.ReqClass - The class of the requirement to get
     * @param props.solutionId - The id of the solution to get the requirement from
     * @returns The requirement
     * @throws {Error} If the requirement does not exist in the organization nor the solution
     */
    async getSolutionRequirementById<RCons extends typeof Requirement>(props: {
        id: InstanceType<RCons>['id'],
        solutionId: Solution['id'],
        ReqClass: RCons,
    }): Promise<InstanceType<RCons>> {
        const em = this._fork(),
            knex = em.getKnex(),
            organizationId = (await this.getOrganization()).id,
            results = await knex
                .select('rs.*', 'rv.*')
                .from({ rs: 'requirement' })
                .join({ rv: 'requirement_versions' }, function () {
                    this.on('rs.id', '=', 'rv.requirement_id')
                        .andOn('rv.effective_from', '=', knex.raw(`(SELECT MAX(effective_from)
                            FROM requirement_versions
                            WHERE requirement_id = rs.id AND effective_from <= now())`)
                        )
                })
                // check that the requirement belongs to the solution
                .join({ rel_req_sol: 'requirement_relation' }, function () {
                    this.on('rs.id', '=', 'rel_req_sol.left_id')
                        .andOn('rel_req_sol.rel_type', '=', `'${RelType.BELONGS}'`)
                        .andOn('rel_req_sol.right_id', '=', `'${props.solutionId}'`)
                })
                .join({ rel_req_sol_v: 'requirement_relation_versions' }, function () {
                    this.on('rel_req_sol.id', '=', 'rel_req_sol_v.requirement_relation_id')
                        .andOn('rel_req_sol_v.effective_from', '=', knex.raw(`(SELECT MAX(effective_from)
                            FROM requirement_relation_versions
                            WHERE requirement_relation_id = rel_req_sol.id AND effective_from <= now())`)
                        )
                })
                // check that the solution belongs to the organization
                .join({ rel_sol_org: 'requirement_relation' }, function () {
                    this.on('rel_req_sol.right_id', '=', 'rel_sol_org.left_id')
                        .andOn('rel_sol_org.rel_type', '=', `'${RelType.BELONGS}'`)
                        .andOn('rel_sol_org.right_id', '=', `'${organizationId}'`)
                })
                .join({ rel_sol_org_v: 'requirement_relation_versions' }, function () {
                    this.on('rel_sol_org.id', '=', 'rel_sol_org_v.requirement_relation_id')
                        .andOn('rel_sol_org_v.effective_from', '=', knex.raw(`(SELECT MAX(effective_from)
                            FROM requirement_relation_versions
                            WHERE requirement_relation_id = rel_sol_org.id AND effective_from <= now())`)
                        )
                })
                .where('rs.id', props.id)
                .andWhere('rs.req_type', ReqType.SOLUTION)

        if (results.length === 0)
            throw new Error('Requirement does not exist in the organization nor the solution')

        const result = results[0]

        return new props.ReqClass(
            Object.entries(result).reduce((acc, [key, value]) => ({
                ...acc, [snakeCaseToCamelCase(key)]: value
            }), {} as any)
        ) as InstanceType<RCons>
    }

    // async deleteOrganization(): Promise<void> {
    //     // delete the organization by creating a new version with isDeleted set to true
    // }
}