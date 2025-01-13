import { Collection, MikroORM, raw, type Options } from "@mikro-orm/postgresql";
import { AppUser, AppUserOrganizationRole } from "~/domain/application";
import { Organization, Requirement, Solution } from "~/domain/requirements";
import { AppUserModel, AppUserOrganizationRoleModel, AppUserOrganizationRoleVersionsModel, AppUserVersionsModel } from "../models/application";
import * as reqModels from "../models/requirements";
import { BelongsModel, BelongsVersionsModel } from "../models/relations";
import { RelType } from "../models/relations/RelType";
import { camelCaseToSnakeCase, pascalCaseToSnakeCase, slugify, snakeCaseToCamelCase } from "#shared/utils";
import { ReqType } from "../models/requirements/ReqType";
import { v7 as uuid7, validate as validateUuid } from 'uuid'

export type OrganizationRepositoryOptions = {
    config: Options,
    organizationId?: Organization['id'],
    organizationSlug?: Organization['slug']
}

export type CreationInfo = {
    createdById: AppUser['id']
    effectiveDate: Date
}

/**
 * Converts a Requirement query to a model query
 * @param query - The query to convert
 * @returns The model query
 */
const reqQueryToModelQuery = (query: Partial<Requirement>) => {
    return Object.entries(query).reduce((acc, [key, value]) => {
        if (['createdById', 'creationDate', 'id'].includes(key))
            return acc
        if (key.endsWith('Id'))
            key = key.slice(0, -2)
        else if (key === 'lastModified')
            key = 'effectiveFrom'
        return { ...acc, [key]: value }
    }, {})
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
            effectiveFrom: auor.effectiveDate,
            modifiedBy: auor.appUserId
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
                createdBy: createdById,
                creationDate: effectiveDate
            })
        })

        await em.flush()

        return newId
    }

    /**
     * Adds a new requirement to the organization
     * @param props.solutionId - The id of the solution to add the requirement to
     * @param props.ReqClass - The Constructor of the requirement to add
     * @param props.reqProps - The properties of the requirement to add
     * @param props.effectiveDate - The effective date of the requirement
     * @param props.createdById - The id of the user creating the requirement
     */
    async addRequirement<RCons extends typeof Requirement>(props: CreationInfo & {
        solutionId: Solution['id'],
        ReqClass: RCons,
        reqProps: Omit<ConstructorParameters<RCons>[0],
            'reqId' | 'lastModified' | 'id' | 'isDeleted'
            | 'effectiveFrom' | 'modifiedById' | 'createdById' | 'creationDate'>
    }): Promise<InstanceType<RCons>['id']> {
        const em = this._fork(),
            newId = uuid7()

        const solution = await this.getSolutionById(props.solutionId)

        if (!solution)
            throw new Error('Solution does not exist')

        // if a property is a uuid, assert that it belongs to the solution
        // This is to prevent a requirement from another solution being added to the current solution
        for (const [key, value] of Object.entries(props.reqProps) as [keyof typeof props.reqProps, string][]) {
            if (validateUuid(value) && ['id', 'createdById', 'modifiedById'].includes(key as string)) {
                // query the Belongs relation to check if the requirement belongs to the solution
                const belongs = await em.findOne(BelongsVersionsModel, {
                    requirementRelation: {
                        left: value,
                        right: props.solutionId
                    },
                    effectiveFrom: { $lte: props.effectiveDate },
                    isDeleted: false
                })

                if (!belongs)
                    throw new Error(`Requirement with id ${value} does not belong to the solution`)
            }
        }

        em.create<reqModels.RequirementVersionsModel>((reqModels as any)[`${props.ReqClass.name}VersionsModel`], {
            id: newId,
            isDeleted: false,
            effectiveFrom: props.effectiveDate,
            modifiedBy: props.createdById,
            // Silent requirements do not have a reqId as they are not approved to be part of the solution
            reqId: props.reqProps.isSilence ? undefined : await this.getNextReqId(props.solutionId, props.ReqClass.reqIdPrefix),
            ...props.reqProps,
            requirement: em.create<reqModels.RequirementModel>((reqModels as any)[props.ReqClass.name], {
                id: newId,
                createdBy: props.createdById,
                creationDate: props.effectiveDate
            })
        })

        // add the relation between the requirement and the solution (Belongs relation)
        em.create(BelongsVersionsModel, {
            isDeleted: false,
            effectiveFrom: props.effectiveDate,
            modifiedBy: props.createdById,
            requirementRelation: em.create(BelongsModel, {
                left: newId,
                right: props.solutionId,
                createdBy: props.createdById,
                creationDate: props.effectiveDate
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
                createdBy: createdById,
                creationDate: effectiveDate
            })
        })

        // add the relation between the solution and the organization (Belongs relation)
        em.create(BelongsVersionsModel, {
            isDeleted: false,
            effectiveFrom: effectiveDate,
            modifiedBy: createdById,
            requirementRelation: em.create(BelongsModel, {
                left: newId,
                right: organization.id,
                createdBy: createdById,
                creationDate: effectiveDate
            })
        })

        await em.flush()

        return newId
    }

    /**
     * Find solutions that match the query parameters for an organization
     *
     * @param query The query parameters to filter solutions by
     * @returns The solutions that match the query parameters
     */
    async findSolutions(query: Partial<Solution>): Promise<Solution[]> {
        const em = this._fork(),
            organizationId = (await this.getOrganization()).id

        const belongsModels = (await em.find(BelongsModel, {
            left: {
                ...(query.id ? { id: query.id } : {}),
                req_type: ReqType.SOLUTION
            },
            right: { id: organizationId, req_type: ReqType.ORGANIZATION }
        }, {
            populate: ['versions'],
            populateFilter: {
                versions: {
                    effectiveFrom: {
                        $eq: raw(`(SELECT MAX(effective_from)
                            FROM requirement_relation_versions
                            WHERE requirement_relation_id = requirement_relation.id AND effective_from <= now())`)
                    },
                    isDeleted: false
                }
            }
        })).filter(belongs => belongs.versions.length > 0)
            .map(belongs => belongs.versions[0].requirementRelation.left.id)

        if (belongsModels.length === 0 && query.id !== undefined)
            throw new Error('Solution does not exist in the organization')

        // TODO: generalize the query. It would be nice to not have to mention the keys
        // but the models need to utilize accessors for reflection to work
        const solutionModels = (await em.find(reqModels.SolutionModel, {
            id: { $in: belongsModels },
            ...(query.createdById ? { createdBy: query.createdById } : {}),
            ...(query.creationDate ? { creationDate: query.creationDate } : {})
        }, {
            populate: ['versions'],
            populateFilter: {
                versions: {
                    effectiveFrom: {
                        $eq: raw(`(SELECT MAX(effective_from)
                            FROM requirement_versions
                            WHERE requirement_id = s.id AND effective_from <= now())`)
                    },
                    isDeleted: false,
                    ...reqQueryToModelQuery(query)
                },
            }
        })).filter(sol => sol.versions.length > 0)

        return solutionModels.map(sol => new Solution({
            createdById: sol.createdBy.id,
            description: sol.versions[0].description,
            lastModified: sol.versions[0].effectiveFrom,
            id: sol.id,
            creationDate: sol.creationDate,
            isDeleted: sol.versions[0].isDeleted,
            isSilence: sol.versions[0].isSilence,
            modifiedById: sol.versions[0].modifiedBy.id,
            name: sol.versions[0].name,
            reqId: sol.versions[0].reqId
        }))
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
        const em = this._fork()

        const reqsInSolution = (await em.find(BelongsModel, {
            left: {
                req_type: pascalCaseToSnakeCase(props.ReqClass.name) as ReqType,
                ...(props.query.id ? { id: props.query.id } : {})
            },
            right: { id: props.solutionId, req_type: ReqType.SOLUTION }
        }, {
            populate: ['versions'],
            populateFilter: {
                versions: {
                    effectiveFrom: {
                        $eq: raw(`(SELECT MAX(effective_from)
                            FROM requirement_relation_versions
                            WHERE requirement_relation_id = requirement_relation.id AND effective_from <= now())`)
                    },
                    isDeleted: false
                }
            }
        }))
            .filter(rel => rel.versions.length > 0)
            .map(rel => rel.versions[0].requirementRelation.left.id)

        if (reqsInSolution.length === 0 && props.query.id !== undefined)
            throw new Error('Requirement does not exist in the solution')

        const requirementModels = (await em.find<reqModels.RequirementModel, 'versions'>((reqModels as any)[`${props.ReqClass.name}Model`], {
            id: { $in: reqsInSolution },
            ...(props.query.createdById ? { createdBy: props.query.createdById } : {}),
            ...(props.query.creationDate ? { creationDate: props.query.creationDate } : {})
        }, {
            populate: ['versions'],
            populateFilter: {
                versions: {
                    effectiveFrom: {
                        $eq: raw(`(SELECT MAX(effective_from)
                        FROM requirement_versions
                        WHERE requirement_id = requirement.id AND effective_from <= now())`)
                    },
                    isDeleted: false,
                    ...Object.entries(props.query).reduce((acc: Record<string, any>, [key, value]) => {
                        if (!['createdById', 'creationDate', 'id'].includes(key))
                            acc[key.endsWith('Id') ? key.slice(0, -2) : key] = value
                        return acc
                    }, {})
                }
            }
        }))
            .filter(req => req.versions.length > 0)

        // TODO
        return requirementModels.map(req => new props.ReqClass({
            id: req.id,
            creationDate: req.creationDate,
            createdById: req.createdBy.id,
            ...Object.entries(req.versions[0]).reduce((acc, [key, value]) => {
                //TODO
            })
        }))
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
     * @throws {Error} If the organization does not exist
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
            lastModified: result.effectiveFrom,
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
            lastModified: result.effectiveFrom,
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
        return (await this.findSolutions({ id: solutionId }))[0]
    }

    /**
     * Gets a solution by slug belonging to the organization
     * @param solutionSlug - The slug of the solution to get
     * @returns The solution
     * @throws {Error} If the solution does not exist in the organization
     * @throws {Error} If the solution does not exist
     */
    async getSolutionBySlug(solutionSlug: Solution['slug']): Promise<Solution> {
        return (await this.findSolutions({ slug: solutionSlug }))[0]
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

    /**
     * Deletes the organization
     * @throws {Error} If the organization does not exist
     */
    async deleteOrganization(): Promise<void> {
        const em = this._fork(),
            organization = await this.getOrganization(),
            effectiveDate = new Date()

        em.create(reqModels.OrganizationVersionsModel, {
            isDeleted: true,
            effectiveFrom: effectiveDate,
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

        // delete all roles associated with the organization by creating a new version with isDeleted set to true
        const orgUsers = await this.getOrganizationAppUsers()

        for (const user of orgUsers) {
            em.create(AppUserOrganizationRoleVersionsModel, {
                isDeleted: true,
                effectiveFrom: effectiveDate,
                role: user.role,
                appUserOrganizationRole: { organization: organization.id, appUser: user.id }
            })
        }

        await em.flush()

        this._organization = this._getOrganization()
    }

    /**
     * Deletes a solution by slug
     * @param slug - The slug of the solution to delete
     * @throws {Error} If the solution does not exist
     * @throws {Error} If the solution does not belong to the organization
     */
    async deleteSolutionBySlug(slug: Solution['slug']): Promise<void> {
        const em = this._fork(),
            organization = await this.getOrganization(),
            effectiveDate = new Date()

        const solution = await this.getSolutionBySlug(slug)

        em.create(reqModels.SolutionVersionsModel, {
            isDeleted: true,
            effectiveFrom: effectiveDate,
            isSilence: false,
            slug: solution.slug,
            name: solution.name,
            description: solution.description,
            modifiedBy: solution.modifiedById,
            requirement: em.create(reqModels.SolutionModel, {
                id: solution.id,
                createdBy: solution.createdById
            })
        })

        // delete all requirements associated with the solution by creating a new version with isDeleted set to true
        const solutionRequirements = await em.findAll(BelongsVersionsModel)
    }
}