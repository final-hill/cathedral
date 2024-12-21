import { Collection, MikroORM, type Options } from "@mikro-orm/postgresql";
import { AppUser, AppUserOrganizationRole } from "~/domain/application";
import { Organization, ReqType, Requirement, Solution } from "~/domain/requirements";
import { AppUserModel, AppUserOrganizationRoleModel, AppUserOrganizationRoleVersionsModel, AppUserVersionsModel } from "../models/application";
import { OrganizationModel, OrganizationVersionsModel, RequirementModel, RequirementVersionsModel, SolutionModel, SolutionVersionsModel } from "../models/requirements";
import { BelongsModel, BelongsVersionsModel } from "../models/relations";

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

        if (await em.findOne(OrganizationModel, { id: newOrg.id }))
            throw new Error('Organization already exists')

        const effectiveDate = new Date(),
            staticModel = em.create(OrganizationModel, {
                id: newOrg.id,
                createdBy: newOrg.createdById,
            }),
            versionModel = em.create(OrganizationVersionsModel, {
                deleted: false,
                effectiveFrom: effectiveDate,
                slug: newOrg.slug,
                name: newOrg.name,
                description: newOrg.description,
                modifiedBy: newOrg.modifiedById,
                isSilence: newOrg.isSilence,
                requirement: newOrg.id,
                ...(newOrg.reqId ? { reqId: newOrg.reqId } : {})
            })

        await em.flush()
    }

    /**
     * Returns the AppUserOrganizationRole for the given app user and organization
     * @param props.appUserId - The id of the app user
     * @param props.organizationId - The id of the organization
     * @returns The AppUserOrganizationRole
     * @throws {Error} If the app user organization role does not exist
     */
    async getAppUserOrganizationRole({ appUserId, organizationId }: { appUserId: AppUser['id'], organizationId: Organization['id'] }): Promise<AppUserOrganizationRole> {
        const em = this._fork(),
            effectiveDate = new Date(),
            auorStatic = await em.findOneOrFail(AppUserOrganizationRoleModel, {
                appUser: { id: appUserId },
                organization: { id: organizationId },
            }),
            auorVolatile = (await auorStatic.versions.matching({
                limit: 1,
                where: { effectiveFrom: { $lte: effectiveDate }, deleted: false },
                orderBy: { effectiveFrom: 'desc' }
            }))[0]

        return new AppUserOrganizationRole({
            appUserId,
            organizationId,
            role: auorVolatile.role,
            effectiveFrom: auorVolatile.effectiveFrom,
            deleted: auorVolatile.deleted
        })
    }

    /**
     * Gets the organization
     * @returns The organization
     */
    async getOrganization(): Promise<Organization> {
        return this._organization
    }

    /**
     * Gets an organization by id or slug
     * @returns The organization
     * @throws {Error} If the organization does not exist
     */
    private async _getOrganization(): Promise<Organization> {
        const em = this._fork(),
            effectiveDate = new Date(),
            latestOrgVersion = await em.findOneOrFail(OrganizationVersionsModel, {
                ...(this._organizationId ? { organization: { id: this._organizationId } } : {}),
                ...(this._organizationSlug ? { slug: this._organizationSlug } : {}),
                effectiveFrom: { $lte: effectiveDate },
                deleted: false
            }, {
                orderBy: { effectiveFrom: 'desc' },
                populate: ['requirement']
            })

        const normalizedStaticModel = await normalizeReqModel<OrganizationModel>(latestOrgVersion.requirement),
            normalizedVersionModel = await normalizeReqModel<OrganizationVersionsModel>(latestOrgVersion)

        return new Organization({
            ...normalizedStaticModel,
            ...normalizedVersionModel
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
    async getOrganizationAppUserById({ id, organizationId }: { id: AppUser['id'], organizationId: Organization['id'] }): Promise<AppUser> {
        const em = this._fork(),
            effectiveDate = new Date(),
            { appUser: staticUser, ...volatileUser } = await em.findOneOrFail(AppUserVersionsModel, {
                appUser: { id },
                effectiveFrom: { $lte: effectiveDate },
                deleted: false
            }, {
                orderBy: { effectiveFrom: 'desc' },
                populate: ['appUser', 'organizations:ref']
            }),
            { role } = await this.getAppUserOrganizationRole({
                appUserId: id,
                organizationId
            })

        return new AppUser({
            creationDate: staticUser.creationDate,
            deleted: volatileUser.deleted,
            effectiveFrom: volatileUser.effectiveFrom,
            email: volatileUser.email,
            id,
            name: volatileUser.name,
            isSystemAdmin: volatileUser.isSystemAdmin,
            lastLoginDate: volatileUser.lastLoginDate,
            role,
            organizationIds: volatileUser.organizations.map((o) => o.requirement.id)
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
            effectiveDate = new Date(),
            volSolution = await em.findOneOrFail(SolutionVersionsModel, {
                requirement: { id: solutionId },
                effectiveFrom: { $lte: effectiveDate },
                deleted: false
            }, { orderBy: { effectiveFrom: 'desc' } }),
            containsCount = (await volSolution.contains.matching({
                where: {
                    reqId: { $like: `${prefix}%` },
                    effectiveFrom: { $lte: effectiveDate },
                    deleted: false
                }
            })).length

        return `${prefix}${containsCount + 1}`
    }

    /**
     * Gets all AppUsers for the organization
     * @throws {Error} If the organization does not exist
     * @returns The AppUsers for the organization
     */
    async getOrganizationAppUsers(): Promise<AppUser[]> {
        const em = this._fork(),
            effectiveDate = new Date(),
            knex = em.getKnex(),
            results = await knex
                .select()
                .from({ su: 'app_user' })
                .join({ suv: 'app_user_versions' }, 'su.id', 'suv.app_user_id')
        //     organization = await this.getOrganization(),
        //     appUsers = await em.find(AppUserVersionsModel, {
        //         appUser: { id: { $in: organization.appUserIds } },
        //         effectiveFrom: { $lte: effectiveDate },
        //         deleted: false
        //     }, {
        //         groupBy: ['appUser.id'],
        //         orderBy: { effectiveFrom: 'desc' },
        //         populate: ['appUser']
        //     }),
        //     roles = await em.find(AppUserOrganizationRoleVersionsModel, {
        //         appUserOrganizationRole: { appUser: { id: { $in: organization.appUserIds } } },
        //         effectiveFrom: { $lte: effectiveDate },
        //         deleted: false
        //     }, {
        //         groupBy: ['appUserOrganizationRole.appUser.id'],
        //         orderBy: { effectiveFrom: 'desc' },
        //         populate: ['appUserOrganizationRole']
        //     })

        // return appUsers.map(model => new AppUser({
        //     creationDate: model.appUser.creationDate,
        //     deleted: model.deleted,
        //     effectiveFrom: model.effectiveFrom,
        //     email: model.email,
        //     id: model.appUser.id,
        //     name: model.name,
        //     isSystemAdmin: model.isSystemAdmin,
        //     lastLoginDate: model.lastLoginDate,
        //     role: model.role,
        //     organizationIds: [organization.id]
        // })
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
        const effectiveDate = new Date(),
            em = this._fork(),
            organization = await this._organization
        //     { requirementRelation: { left: staticReqModel } } = await em.findOneOrFail(BelongsVersionsModel, {
        //         deleted: false,
        //         effectiveFrom: { $lte: effectiveDate },
        //         requirementRelation: {
        //             left: props.id,
        //             right: props.solutionId
        //         }
        //     }, {
        //         orderBy: { effectiveFrom: 'desc' },
        //         populate: ['requirementRelation.left']
        //     }),
        //     volatileReqModel = (await staticReqModel.versions.matching({
        //         limit: 1,
        //         where: { effectiveFrom: { $lte: effectiveDate }, deleted: false },
        //         orderBy: { effectiveFrom: 'desc' }
        //     }))[0]

        // const normalizedStaticReqModel = await normalizeReqModel<RequirementModel>(staticReqModel),
        //     normalizedVolatileReqModel = normalizeReqVersionModel(volatileReqModel)
    }

    // async deleteOrganization(): Promise<void> {
    //     // delete the organization by creating a new version with deleted set to true
    // }
}