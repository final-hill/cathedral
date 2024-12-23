import { Collection, MikroORM, type Options } from "@mikro-orm/postgresql";
import { AppUser, AppUserOrganizationRole } from "~/domain/application";
import { Organization, Requirement, Solution } from "~/domain/requirements";
import { AppUserModel, AppUserOrganizationRoleModel, AppUserOrganizationRoleVersionsModel, AppUserVersionsModel } from "../models/application";
import { OrganizationModel, OrganizationVersionsModel, RequirementModel, RequirementVersionsModel, SolutionModel, SolutionVersionsModel } from "../models/requirements";
import { BelongsModel, BelongsVersionsModel } from "../models/relations";
import { RelType } from "../models/relations/RelType";
import { snakeCaseToCamelCase } from "~/shared/utils/snakeCaseToCamelCase";
import { ReqType } from "../models/requirements/ReqType";
import { camelCaseToSnakeCase } from "~/shared/utils/camelCaseToSnakeCase";

export type OrganizationRepositoryOptions = {
    config: Options,
    organizationId?: Organization['id'],
    organizationSlug?: Organization['slug']
}

type NormalizedReqModel<R extends (RequirementModel | RequirementVersionsModel)> = {
    [K in keyof R as
    R[K] extends AppUserModel ? `${K & string}Id` :
    R[K] extends Collection<any> ? `${K extends `${infer P}s` ? `${P}Ids` : never}` :
    R[K] extends RequirementModel ? `${K & string}Id` :
    R[K] extends RequirementVersionsModel ? `${K & string}Id` :
    K]:
    R[K] extends AppUserModel ? R[K]['id'] : // user id
    R[K] extends Collection<infer C> ? string[] : // array of ids
    R[K] extends RequirementModel ? R[K]['id'] : // requirement id
    R[K] extends RequirementVersionsModel ? R[K]['requirement']['id'] : // requirement id
    R[K]
}

/**
 * Normalizes a RequirementModel to a format that can be used to create a new Requirement domain object
 */
const normalizeReqModel = async <R extends (RequirementModel | RequirementVersionsModel)>(model: R): Promise<NormalizedReqModel<R>> => {
    const result: any = {}
    for (const key in model) {
        const k = key as keyof R & string
        switch (true) {
            case model[k] instanceof Collection:
                // ${k} ends with an 's' so we remove it and add 'Ids' to the end
                result[`${k.slice(0, -1)}Ids`] = (await (model[k] as Collection<any>)
                    .init({ ref: true })).map((m: any) => {
                        switch (true) {
                            case m instanceof RequirementModel: return m.id
                            case m instanceof AppUserModel: return m.id
                            case m instanceof RequirementVersionsModel: return m.requirement.id
                            default: return m
                        }
                    })
                break
            case model[k] instanceof AppUserModel: result[`${k}Id`] = model[k].id; break
            case model[k] instanceof RequirementModel: result[`${k}Id`] = model[k].id; break
            case model[k] instanceof RequirementVersionsModel: result[`${k}Id`] = model[k].requirement.id; break
            default: result[k] = model[k]
        }
    }

    return result
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
     * Adds a new organization
     * @param newOrg - The organization to add
     * @throws {Error} If the organization already exists
     */
    async addOrganization(newOrg: Organization): Promise<void> {
        const em = this._fork();

        // if (await em.findOne(OrganizationModel, { id: newOrg.id }))
        //     throw new Error('Organization already exists')

        // const effectiveDate = new Date(),
        //     staticModel = em.create(OrganizationModel, {
        //         id: newOrg.id,
        //         createdBy: newOrg.createdById,
        //     }),
        //     versionModel = em.create(OrganizationVersionsModel, {
        //         deleted: false,
        //         effectiveFrom: effectiveDate,
        //         slug: newOrg.slug,
        //         name: newOrg.name,
        //         description: newOrg.description,
        //         modifiedBy: newOrg.modifiedById,
        //         isSilence: newOrg.isSilence,
        //         requirement: newOrg.id,
        //         ...(newOrg.reqId ? { reqId: newOrg.reqId } : {})
        //     })

        // await em.flush()
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
            organizationId = (await this.getOrganization()).id,
            results = await knex
                .select('s.*', 'sv.*')
                .from({ s: 'requirement' })
                .join({ sv: 'requirement_versions' }, function () {
                    this.on('s.id', '=', 'sv.solution_id')
                        .andOn('sv.effective_from', '=', knex.raw(`(SELECT MAX(effective_from)
                            FROM requirement_versions
                            WHERE solution_id = s.id AND effective_from <= now())`)
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
                .where(Object.entries(query).reduce((acc, [key, value]) => ({
                    ...acc,
                    // TODO: Do these need to be prefixed with 'sv.' or 's.'?
                    // If so, then it probably can't be done generically unless
                    // the schemas are changed to treat all non-key attributes as volatile
                    [camelCaseToSnakeCase(key)]: value
                }), {}))
    }

    /**
     * Returns the AppUserOrganizationRole for the given app user and organization
     * @param props.appUserId - The id of the app user
     * @param props.organizationId - The id of the organization
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
                    deleted: 'auorv.deleted'
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
            deleted: result.deleted
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
                    deleted: 'rv.deleted',
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

        return results.map((result) => new Organization({
            creationDate: result.creationDate,
            deleted: result.deleted,
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
                    deleted: 'rv.deleted',
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
            deleted: result.deleted,
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
                    deleted: 'rv.deleted',
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
            deleted: result.deleted,
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
     * @param props.organizationId The id of the organization
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
                    deleted: 'suv.deleted',
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
                .andWhere('suv.deleted', false)
                .andWhere('auorv.deleted', false)

        if (results.length === 0)
            throw new Error('App user does not exist in the organization')

        const result = results[0]

        return new AppUser({
            creationDate: result.creationDate,
            deleted: result.deleted,
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
                // requirement_relation { left_id: requirement_id, right_id: solution_id, rel_type: RelType.BELONGS }
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
                    deleted: 'suv.deleted',
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
                .where('suv.deleted', false)
                .andWhere('auorv.deleted', false)

        return results.map((result) => new AppUser({
            creationDate: result.creationDate,
            deleted: result.deleted,
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
    //     // delete the organization by creating a new version with deleted set to true
    // }
}