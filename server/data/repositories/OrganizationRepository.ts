import { Collection, MikroORM, type Options } from "@mikro-orm/postgresql";
import { AppUser, AppUserOrganizationRole } from "~/domain/application";
import { Organization, ReqType, Requirement, Solution } from "~/domain/requirements";
import { AppUserModel, AppUserOrganizationRoleModel, AppUserOrganizationRoleVersionsModel, AppUserVersionsModel } from "../models/application";
import { OrganizationModel, OrganizationVersionsModel, RequirementModel, RequirementVersionsModel, SolutionModel, SolutionVersionsModel } from "../models/requirements";
import { BelongsModel, BelongsVersionsModel } from "../models/relations";
import { p } from "@vite-pwa/assets-generator/dist/shared/assets-generator.5e51fd40.mjs";

export type OrganizationRepositoryOptions = {
    config: Options,
    organizationId?: Organization['id'],
    organizationSlug?: Organization['slug']
}

type NormalizedReqModel<R extends RequirementModel> = {
    [K in keyof R as
    R[K] extends AppUserModel ? `${K & string}Id` :
    R[K] extends Collection<any> ? `${K & string}Ids` :
    R[K] extends RequirementModel ? `${K & string}Id` :
    K]:
    R[K] extends AppUserModel ? R[K]['id'] : // user id
    R[K] extends Collection<infer C> ? string[] : // array of ids
    R[K] extends RequirementModel ? R[K]['id'] : // requirement id
    R[K]
}

/**
 * Normalizes a RequirementModel to a format that can be used to create a new Requirement domain object
 */
const normalizeReqModel = async <R extends RequirementModel>(model: R): Promise<NormalizedReqModel<R>> => {
    const result: any = {}
    for (const key in model) {
        const k = key as keyof RequirementModel
        if (model[k] instanceof Collection)
            result[`${k}Ids`] = (await (model[k] as Collection<any>).init({ ref: true })).map((m: any) => m.id)
        else if (model[k] instanceof AppUserModel)
            result[`${k}Id`] = model[k].id
        else if ((model[k] as any) instanceof RequirementModel)
            result[`${k}Id`] = (model[k] as any as RequirementModel).id
        else
            result[k] = model[k]
    }
    return result
}

type NormalizedReqVersionModel<R extends Omit<RequirementVersionsModel, 'requirement'>> = {
    [K in keyof R as
    R[K] extends AppUserModel ? `${K & string}Id` :
    R[K] extends RequirementModel ? `${K & string}Id` :
    K]:
    R[K] extends AppUserModel ? R[K]['id'] :
    R[K] extends RequirementModel ? R[K]['id'] :
    R[K]
}

/**
 * Normalizes a RequirementVersionsModel to a format that can be used to create a new Requirement domain object
 */
const normalizeReqVersionModel = <R extends Omit<RequirementVersionsModel, 'requirement'>>(model: R): NormalizedReqVersionModel<R> => {
    const result: any = {}
    for (const key in model) {
        const k = key as keyof R & string
        if (model[k] instanceof AppUserModel)
            result[`${k}Id`] = model[k].id
        else if ((model[k] as any) instanceof RequirementModel)
            result[`${k}Id`] = (model[k] as any as RequirementModel).id
        else
            result[k] = model[k]
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
            role: auorStatic.role,
            effectiveFrom: auorVolatile.effectiveFrom,
            deleted: auorVolatile.deleted
        })
    }

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
            { requirement: staticOrg, ...volatileOrg } = await em.findOneOrFail(OrganizationVersionsModel, {
                ...(this._organizationId ? { organization: { id: this._organizationId } } : {}),
                ...(this._organizationSlug ? { slug: this._organizationSlug } : {}),
                effectiveFrom: { $lte: effectiveDate },
                deleted: false
            }, {
                orderBy: { effectiveFrom: 'desc' },
                populate: ['requirement']
            })

        const normalizedStaticModel = await normalizeReqModel<OrganizationModel>(staticOrg),
            normalizedVersionModel = normalizeReqVersionModel<Omit<OrganizationVersionsModel, 'requirement'>>(volatileOrg)

        return new Organization({
            ...normalizedStaticModel,
            ...normalizedVersionModel
        })
    }

    /**
     * Get an app user by id
     *
     * @param id The id of the app user to get
     * @returns The app user
     * @throws {Error} If the app user does not exist
     */
    async getAppUserById(id: AppUser['id']): Promise<AppUser> {
        const em = this._fork(),
            effectiveDate = new Date(),
            { appUser: staticUser, ...volatileUser } = await em.findOneOrFail(AppUserVersionsModel, {
                appUser: { id },
                effectiveFrom: { $lte: effectiveDate },
                deleted: false
            }, {
                orderBy: { effectiveFrom: 'desc' },
                populate: ['appUser']
            }),
            { role } = await this.getAppUserOrganizationRole({
                appUserId: id,
                organizationId: (await this.getOrganization()).id
            })

        return new AppUser({
            creationDate: staticUser.creationDate,
            deleted: volatileUser.deleted,
            effectiveFrom: volatileUser.effectiveFrom,
            email: volatileUser.email,
            id: staticUser.id,
            name: volatileUser.name,
            isSystemAdmin: volatileUser.isSystemAdmin,
            lastLoginDate: volatileUser.lastLoginDate,
            role
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
     * Gets all AppUsers for the organization filtered by the provided query
     * @throws {Error} If the organization does not exist
     * @returns The AppUsers for the organization
     */
    async getOrganizationAppUsers(): Promise<AppUser[]> {
        const em = this._fork(),
            organization = await this.getOrganization(),
            effectiveDate = new Date()

        // TODO: Create Organization <-[m:n]-> AppUser relationship. Use the existing auor as the pivot table

        const auorVersions = (await em.find(AppUserOrganizationRoleVersionsModel, {
            appUserOrganizationRole: { organization: organization.id },
            effectiveFrom: { $lte: effectiveDate },
            deleted: false
        }, {
            orderBy: { effectiveFrom: 'desc' },
            populate: ['appUserOrganizationRole']
        })) //.map((model: AppUserOrganizationRoleVersionsModel) => model.appUserOrganizationRole.appUser.id)

        const versionedAppUserModels = (await em.find(AppUserVersionsModel, {
            appUser: { id: { $in: auorVersions } },
            effectiveFrom: { $lte: effectiveDate },
            deleted: false
        }, {
            orderBy: { effectiveFrom: 'desc' },
            groupBy: ['appUser.id'],
            populate: ['appUser']
        }))

        return versionedAppUserModels.map((model: AppUserVersionsModel) => new AppUser({
            creationDate: model.appUser.creationDate,
            deleted: model.deleted,
            effectiveFrom: model.effectiveFrom,
            email: model.email,
            id: model.appUser.id,
            name: model.name,
            isSystemAdmin: model.isSystemAdmin,
            lastLoginDate: model.lastLoginDate,
            role: model.role
        }))
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