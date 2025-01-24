import { Collection, MikroORM, raw, type Options } from "@mikro-orm/postgresql";
import { AppUser, AppUserOrganizationRole } from "~/domain/application";
import * as req from "~/domain/requirements";
import * as reqModels from "../models/requirements";
import { AppUserModel, AppUserOrganizationRoleModel, AppUserOrganizationRoleVersionsModel } from "../models/application";
import { BelongsModel, BelongsVersionsModel } from "../models/relations";
import { pascalCaseToSnakeCase, slugify, snakeCaseToCamelCase } from "#shared/utils";
import { ReqType } from "../models/requirements/ReqType";
import { v7 as uuid7 } from 'uuid'
import { AuditMetadata } from "~/domain/AuditMetadata";

export type OrganizationRepositoryOptions = {
    config: Options,
    organizationId?: req.Organization['id'],
    organizationSlug?: req.Organization['slug']
}

export type CreationInfo = {
    createdById: AppUser['id']
    effectiveDate: Date
}

export type UpdationInfo = {
    modifiedById: AppUser['id']
    modifiedDate: Date
}

export type DeletionInfo = {
    deletedById: AppUser['id']
    deletedDate: Date
}

// TODO: This is an Adapter.
/**
 * Converts a Requirement query to a model query
 * @param query - The query to convert
 * @returns The model query
 */
const reqQueryToModelQuery = (query: Partial<req.Requirement>) => {
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

// TODO: This is an Adapter.
/**
 * Converts a data model to a domain model
 * @param model - The data model to convert
 * @returns The domain model
 */
const dataModelToDomainModel = <M extends reqModels.RequirementModel, R extends req.Requirement>(model: M): R => {
    const staticProps = Object.entries(model).reduce((acc, [key, value]) => {
        if (typeof value === 'object' && value !== null && 'id' in value)
            return { ...acc, [`${key}Id`]: value.id }
        else if (key === 'versions' || key === 'latestVersion')
            return acc // skip
        else
            return { ...acc, [key]: value }
    }, {})

    const version = model.latestVersion!.getEntity()

    const versionProps = Object.entries(version).reduce((acc, [key, value]) => {
        if (key === 'requirement')
            return acc // skip
        else if (typeof value === 'object' && value !== null && 'id' in value)
            return { ...acc, [`${key}Id`]: value.id }
        else if (key === 'effectiveFrom')
            return { ...acc, lastModified: value }
        else if (value instanceof Collection)
            return { ...acc, [`${key}Ids`]: value.getItems().map(item => item.id) }
        else
            return { ...acc, [key]: value }
    }, {})

    return { ...staticProps, ...versionProps } as R
}

export class OrganizationRepository {
    private _orm

    private _organizationId?: req.Organization['id']
    private _organizationSlug?: req.Organization['slug']
    /** This is not readonly because it can be reassigned in {@link #deleteOrganization} */
    private _organization: Promise<req.Organization>

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
     * @throws {Error} If the app user organization role already exists
     */
    async addAppUserOrganizationRole(auor: Pick<AppUserOrganizationRole, 'appUserId' | 'role' | 'organizationId'> & CreationInfo): Promise<void> {
        const em = this._fork(),
            existingAuor = await em.findOne(AppUserOrganizationRoleModel, {
                appUser: auor.appUserId,
                organization: auor.organizationId,
                latestVersion: { isDeleted: false }
            }, { populate: ['latestVersion'] }),
            existingRole = (await existingAuor?.latestVersion?.load())?.role

        if (existingRole === auor.role)
            throw new Error('App user organization role already exists with the same role')

        em.create(AppUserOrganizationRoleVersionsModel, {
            appUserOrganizationRole: existingAuor ?? em.create(AppUserOrganizationRoleModel, {
                appUser: auor.appUserId,
                organization: auor.organizationId,
                createdBy: auor.createdById,
                creationDate: auor.effectiveDate
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
     * @returns The id of the organization
     * @throws {Error} If the organization already exists
     */
    async addOrganization(props: Pick<req.Organization, 'name' | 'description'> & CreationInfo): Promise<req.Organization['id']> {
        const em = this._fork(),
            existingOrgStatic = await em.findOne(reqModels.OrganizationModel, {
                latestVersion: {
                    slug: slugify(name),
                    isDeleted: false
                } as reqModels.OrganizationVersionsModel
            }, {
                populate: ['latestVersion']
            }),
            latestVersion = existingOrgStatic?.latestVersion as reqModels.OrganizationVersionsModel | undefined

        if (latestVersion)
            throw new Error('Organization already exists with the same name')

        const newId = uuid7()

        em.create(reqModels.OrganizationVersionsModel, {
            isDeleted: false,
            effectiveFrom: props.effectiveDate,
            isSilence: false,
            slug: slugify(name),
            name,
            description: props.description,
            modifiedBy: props.createdById,
            requirement: existingOrgStatic ?? em.create(reqModels.OrganizationModel, {
                id: newId,
                createdBy: props.createdById,
                creationDate: props.effectiveDate
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
    async addRequirement<RCons extends typeof req.Requirement>(props: CreationInfo & {
        solutionId: req.Solution['id'],
        ReqClass: RCons,
        reqProps: Omit<InstanceType<RCons>, 'reqId' | 'id' | keyof AuditMetadata>
    }): Promise<InstanceType<RCons>['id']> {
        const em = this._fork(),
            newId = uuid7()

        const solution = await this.getSolutionById(props.solutionId)

        if (!solution)
            throw new Error('Solution does not exist')

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
    async addSolution({ name, description, createdById, effectiveDate }: Pick<req.Solution, 'name' | 'description'> & CreationInfo): Promise<req.Solution['id']> {
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

        // add the relation between the solution and the organization
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
     * Deletes an app user organization role
     * @param auor.appUserId - The id of the app user
     * @param auor.organizationId - The id of the organization
     * @param auor.deletedById - The id of the user deleting the app user organization role
     * @param auor.effectiveDate - The effective date of the deletion
     * @throws {Error} If the app user organization role does not exist
     */
    async deleteAppUserOrganizationRole(auor: Pick<AppUserOrganizationRole, 'appUserId' | 'organizationId'> & DeletionInfo): Promise<void> {
        const em = this._fork(),
            existingAuor = await em.findOne(AppUserOrganizationRoleModel, {
                appUser: auor.appUserId,
                organization: await this.getOrganization(),
                latestVersion: { isDeleted: false }
            }, { populate: ['latestVersion'] })

        if (!existingAuor || !existingAuor.latestVersion)
            throw new Error('App user organization role does not exist')

        em.create(AppUserOrganizationRoleVersionsModel, {
            ...existingAuor.latestVersion.get(),
            isDeleted: true,
            effectiveFrom: auor.deletedDate,
            modifiedBy: auor.deletedById
        })

        await em.flush()
    }

    /**
     * Deletes the organization
     * @param props.deletedById - The id of the user deleting the organization
     * @throws {Error} If the organization does not exist
     */
    async deleteOrganization(props: DeletionInfo): Promise<void> {
        const em = this._fork(),
            { id, slug, name, description } = await this.getOrganization()

        em.create(reqModels.OrganizationVersionsModel, {
            isDeleted: true,
            effectiveFrom: props.deletedDate,
            isSilence: false,
            slug,
            name,
            description,
            modifiedBy: props.deletedById,
            requirement: await em.findOneOrFail(reqModels.OrganizationModel, { id })
        })

        // delete all AppUserOrganizationRoles associated with the organization
        const orgUsers = await this.getOrganizationAppUsers()

        await Promise.all(orgUsers.map(user => this.deleteAppUserOrganizationRole({
            appUserId: user.id,
            organizationId: id,
            deletedById: props.deletedById,
            deletedDate: props.deletedDate
        })))

        // delete all solutions associated with the organization
        const orgSolutions = await this.findSolutions({})

        await Promise.all(orgSolutions.map(sol => this.deleteSolutionBySlug({
            deletedById: props.deletedById,
            slug: sol.slug,
            deletedDate: props.deletedDate
        })))

        await em.flush()

        this._organization = this._getOrganization()
    }

    /**
     * Deletes a solution by slug
     * @param props.deletedById - The id of the user deleting the solution
     * @param props.slug - The slug of the solution to delete
     * @throws {Error} If the solution does not exist
     * @throws {Error} If the solution does not belong to the organization
     */
    async deleteSolutionBySlug(props: DeletionInfo & Pick<req.Solution, 'slug'>): Promise<void> {
        const em = this._fork(),
            solution = await this.getSolutionBySlug(props.slug)

        em.create(reqModels.SolutionVersionsModel, {
            isDeleted: true,
            effectiveFrom: props.deletedDate,
            isSilence: false,
            slug: solution.slug,
            name: solution.name,
            description: solution.description,
            modifiedBy: props.deletedById,
            requirement: await em.findOneOrFail(reqModels.SolutionModel, { id: solution.id })
        })

        // delete all requirements associated with the solution

        const reqIdTypesInSolution = (await em.find(BelongsModel, {
            right: solution.id,
            latestVersion: { isDeleted: false }
        }, {
            populate: ['latestVersion']
        }))
            .filter(rel => rel.latestVersion != undefined)
            .map(rel => ({
                id: rel.latestVersion!.get().requirementRelation.left.id,
                req_type: rel.latestVersion!.get().requirementRelation.left.req_type
            }))

        // The keys representing the requirement classes in the req module
        type RCons = keyof { [K in keyof typeof req]: typeof req[K] extends typeof req.Requirement ? K : never }

        await Promise.all(reqIdTypesInSolution.map(reqIdType => this.deleteSolutionRequirementById({
            id: reqIdType.id,
            deletedById: props.deletedById,
            deletedDate: props.deletedDate,
            solutionId: solution.id,
            ReqClass: req[snakeCaseToCamelCase(reqIdType.req_type) as RCons] as typeof req.Requirement
        })))

        await em.flush()
    }

    /**
     * Deletes a requirement belonging to a solution by id
     * @param props.deletedById - The id of the user deleting the requirement
     * @param props.effectiveDate - The effective date of the deletion
     * @param props.id - The id of the requirement to delete
     * @param props.solutionId - The id of the solution the requirement belongs to
     * @param props.ReqClass - The Constructor of the requirement to delete
     * @throws {Error} If the requirement does not exist
     * @throws {Error} If the requirement does not belong to the solution
     * @throws {Error} If the solution does not exist
     */
    async deleteSolutionRequirementById<RCons extends typeof req.Requirement>(
        props: DeletionInfo & {
            id: string,
            solutionId: string,
            ReqClass: RCons
        }
    ): Promise<void> {
        // delete the requirement associated with the solution by creating a new version with isDeleted set to true
        const em = this._fork()

        const existingReq = await em.findOneOrFail<reqModels.RequirementModel, 'latestVersion'>(
            reqModels[`${props.ReqClass.name}Model` as keyof typeof reqModels], {
            id: props.id,
            latestVersion: { isDeleted: false }
        }, {
            populate: ['latestVersion']
        })

        if (!existingReq.latestVersion)
            throw new Error(`Requirement does not exist with id ${props.id}`)

        // "delete" the requirement by creating a new version with isDeleted set to true
        em.create<reqModels.RequirementVersionsModel>(
            reqModels[`${props.ReqClass.name}VersionsModel` as keyof typeof reqModels], {
            ...existingReq.latestVersion.get(),
            isDeleted: true
        })

        // "delete" the relation between the requirement and the solution (Belongs relation)
        const rel = await em.findOneOrFail(BelongsModel, {
            left: props.id,
            right: props.solutionId,
            latestVersion: { isDeleted: false }
        }, {
            populate: ['latestVersion']
        })

        if (!rel.latestVersion)
            throw new Error(`Requirement does not belong to solution with id ${props.solutionId}`)

        em.create(BelongsVersionsModel, {
            ...rel.latestVersion.get(),
            isDeleted: true
        })

        await em.flush()
    }

    /**
     * Find solutions that match the query parameters for an organization
     *
     * @param query The query parameters to filter solutions by
     * @returns The solutions that match the query parameters
     */
    async findSolutions(query: Partial<req.Solution>): Promise<req.Solution[]> {
        const em = this._fork(),
            organizationId = (await this.getOrganization()).id

        const belongsModels = (await em.find(BelongsModel, {
            left: {
                ...(query.id ? { id: query.id } : {}),
                req_type: ReqType.SOLUTION
            },
            right: { id: organizationId, req_type: ReqType.ORGANIZATION },
            latestVersion: { isDeleted: false }
        }, {
            populate: ['latestVersion']
        }))
            .filter(belongs => belongs.latestVersion != undefined)
            .map(belongs => belongs.latestVersion!.get().requirementRelation.left.id)

        if (belongsModels.length === 0 && query.id !== undefined)
            throw new Error('Solution does not exist in the organization')

        const solutionModels = (await em.find(reqModels.SolutionModel, {
            id: { $in: belongsModels },
            ...(query.createdById ? { createdBy: query.createdById } : {}),
            ...(query.creationDate ? { creationDate: query.creationDate } : {}),
            latestVersion: {
                isDeleted: false,
                ...reqQueryToModelQuery(query)
            }
        }, {
            populate: ['latestVersion']
        })).filter(sol => sol.latestVersion != undefined)

        return solutionModels.map(sol => new req.Solution(dataModelToDomainModel(sol)))
    }

    /**
     * Find app user organization roles that match the query parameters for an organization
     * @param query - The query parameters to filter app user organization roles by
     * @returns The app user organization roles that match the query parameters
     */
    async findAppUserOrganizationRoles(query: Partial<Omit<AppUserOrganizationRole, 'organizationId'>>): Promise<AppUserOrganizationRole[]> {
        const em = this._fork(),
            organizationId = (await this.getOrganization()).id

        const auors = (await em.find(AppUserOrganizationRoleModel, {
            organization: organizationId,
            latestVersion: { isDeleted: false }
        }, {
            populate: ['latestVersion']
        }))
            .filter(auor => auor.latestVersion != undefined)

        return auors.map(auor => {
            const auorv = auor.latestVersion!.get()

            return new AppUserOrganizationRole({
                appUserId: auor.appUser.id,
                organizationId,
                role: auorv.role,
                isDeleted: auorv.isDeleted,
                createdById: auor.createdBy.id,
                modifiedById: auorv.modifiedBy.id,
                creationDate: auor.creationDate,
                lastModified: auorv.effectiveFrom
            })
        })
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
    async findSolutionRequirementsByType<RCons extends typeof req.Requirement>(props: {
        solutionId: req.Solution['id'],
        ReqClass: RCons,
        query: Partial<InstanceType<RCons>>
    }): Promise<InstanceType<RCons>[]> {
        const em = this._fork()

        const reqsInSolution = (await em.find(BelongsModel, {
            left: {
                req_type: pascalCaseToSnakeCase(props.ReqClass.name) as ReqType,
                ...(props.query.id ? { id: props.query.id } : {})
            },
            right: { id: props.solutionId, req_type: ReqType.SOLUTION },
            latestVersion: { isDeleted: false }
        }, {
            populate: ['latestVersion']
        }))
            .filter(rel => rel.latestVersion != undefined)
            .map(rel => rel.latestVersion!.get().requirementRelation.left.id)

        if (reqsInSolution.length === 0 && props.query.id !== undefined)
            throw new Error('Requirement does not exist in the solution')

        const requirementModels = (await em.find<reqModels.RequirementModel, 'latestVersion'>((reqModels as any)[`${props.ReqClass.name}Model`], {
            id: { $in: reqsInSolution },
            ...(props.query.createdById ? { createdBy: props.query.createdById } : {}),
            ...(props.query.creationDate ? { creationDate: props.query.creationDate } : {}),
            latestVersion: {
                isDeleted: false,
                ...reqQueryToModelQuery(props.query)
            }
        }, {
            populate: ['latestVersion']
        }))
            .filter(req => req.latestVersion != undefined)

        return requirementModels.map(req => new props.ReqClass(dataModelToDomainModel(req))) as InstanceType<RCons>[]
    }

    /**
     * Returns the AppUserOrganizationRole for the given app user and organization
     * @param props.appUserId - The id of the app user
     * @returns The AppUserOrganizationRole
     * @throws {Error} If the app user organization role does not exist
     */
    async getAppUserOrganizationRole(appUserId: AppUser['id']): Promise<AppUserOrganizationRole> {
        const organizationId = (await this.getOrganization()).id,
            em = this._fork()

        const auor = await em.findOne(AppUserOrganizationRoleModel, {
            appUser: appUserId,
            organization: organizationId
        }, {
            populate: ['versions'],
            populateFilter: {
                versions: {
                    effectiveFrom: {
                        $eq: raw(`(SELECT MAX(effective_from)
                            FROM app_user_organization_role_versions
                            WHERE app_user_organization_role_id = app_user_organization_role.id AND effective_from <= now())`)
                    },
                    isDeleted: false
                }
            }
        })

        if (!auor || !auor.versions[0])
            throw new Error('App user organization role does not exist')

        const auorv = auor.versions[0]

        return new AppUserOrganizationRole({
            appUserId,
            organizationId,
            role: auorv.role,
            isDeleted: auorv.isDeleted,
            createdById: auor.createdBy.id,
            modifiedById: auorv.modifiedBy.id,
            creationDate: auor.creationDate,
            lastModified: auorv.effectiveFrom
        })
    }

    /**
     * Returns all organizations associated with the app user
     * @param appUserId - The id of the app user
     * @returns The organizations associated with the app user
     */
    async getAppUserOrganizations(appUserId: AppUser['id']): Promise<req.Organization[]> {
        const em = this._fork()

        const auors = (await em.find(AppUserOrganizationRoleModel, {
            appUser: appUserId,
            latestVersion: { isDeleted: false }
        }, {
            populate: ['latestVersion']
        }))
            .filter(auor => auor.latestVersion != undefined)

        const organizationIds = auors.map(auor => auor.organization.id)

        const organizations = (await em.find(reqModels.OrganizationModel, {
            id: { $in: organizationIds },
            latestVersion: { isDeleted: false }
        }, {
            populate: ['latestVersion']
        }))
            .filter(org => org.latestVersion != undefined)

        return organizations.map(org => new req.Organization(dataModelToDomainModel(org)))
    }

    /**
     * Gets the organization
     * @returns The organization
     * @throws {Error} If the organization does not exist
     */
    async getOrganization(): Promise<req.Organization> {
        return this._organization
    }

    /**
     * Gets all organizations
     * @returns The organizations
     */
    async getAllOrganizations(): Promise<req.Organization[]> {
        const em = this._fork()

        const organizations = (await em.find(reqModels.OrganizationModel, {
            latestVersion: { isDeleted: false }
        }, {
            populate: ['latestVersion']
        }))
            .filter(org => org.latestVersion != undefined)

        return organizations.map(org => new req.Organization(dataModelToDomainModel(org)))
    }

    /**
     * Gets an organization by id or slug
     * @returns The organization
     * @throws {Error} If the organization does not exist
     */
    private async _getOrganization(): Promise<req.Organization> {
        const em = this._fork();

        const organizationId = this._organizationId,
            organizationSlug = this._organizationSlug

        if (!organizationId && !organizationSlug)
            throw new Error('Organization id or slug must be provided')

        const result = await em.findOne(reqModels.OrganizationModel, {
            ...(organizationId ? { id: organizationId } : {}),
            latestVersion: {
                ...(organizationSlug ? { slug: organizationSlug } : {}),
                isDeleted: false
            }
        }, {
            populate: ['latestVersion']
        })

        if (!result || !result.latestVersion)
            throw new Error('Organization does not exist')

        return new req.Organization(dataModelToDomainModel(result))
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
            organizationId = (await this.getOrganization()).id

        const auor = await em.findOne(AppUserOrganizationRoleModel, {
            appUser: id,
            organization: organizationId,
            latestVersion: { isDeleted: false }
        }, {
            populate: ['latestVersion']
        })

        if (!auor || !auor.latestVersion)
            throw new Error('App user does not exist in the organization')

        const auorv = auor.latestVersion.get()

        const user = await em.findOne(AppUserModel, {
            id,
            latestVersion: { isDeleted: false }
        }, {
            populate: ['latestVersion']
        })

        if (!user || !user.latestVersion)
            throw new Error('App user does not exist')

        const userv = user.latestVersion.get()

        return new AppUser({
            id,
            name: userv.name,
            email: userv.email,
            isSystemAdmin: userv.isSystemAdmin,
            lastLoginDate: userv.lastLoginDate,
            creationDate: user.creationDate,
            effectiveFrom: auorv.effectiveFrom,
            isDeleted: auorv.isDeleted,
            role: auorv.role
        })
    }

    /**
     * Gets the next requirement id for the given solution and prefix
     *
     * @param solutionId - The id of the solution
     * @param prefix - The prefix for the requirement id. Ex: 'P.1.'
     * @returns The next requirement id
     * @throws {Error} If the solution does not exist
     */
    async getNextReqId<R extends typeof req.Requirement>(solutionId: req.Solution['id'], prefix: R['reqIdPrefix']): Promise<InstanceType<R>['reqId']> {
        const em = this._fork()

        const reqsBelongingToSolution = (await em.find(BelongsModel, {
            right: solutionId,
            latestVersion: { isDeleted: false }
        }, {
            populate: ['latestVersion']
        }))
            .filter(rel => rel.latestVersion != undefined)
            .map(rel => rel.latestVersion!.get().requirementRelation.left.id)

        if (reqsBelongingToSolution.length === 0)
            return `${prefix}1`

        const reqs = (await em.find(reqModels.RequirementModel, {
            id: { $in: reqsBelongingToSolution },
            latestVersion: {
                isDeleted: false,
                reqId: { $like: `${prefix}%` }
            }
        }, {
            populate: ['latestVersion']
        }))
            .filter(req => req.latestVersion != undefined)
            .map(req => req.latestVersion!.get().reqId)

        const count = reqs.length

        if (count === 0)
            return `${prefix}1`

        return `${prefix}${count + 1}`
    }

    /**
     * Gets all AppUsers for the organization
     * @throws {Error} If the organization does not exist
     * @returns The AppUsers for the organization
     */
    async getOrganizationAppUsers(): Promise<AppUser[]> {
        const em = this._fork(),
            organizationId = (await this.getOrganization()).id

        const auors = (await em.find(AppUserOrganizationRoleModel, {
            organization: organizationId,
            latestVersion: { isDeleted: false }
        }, {
            populate: ['latestVersion']
        }))
            .filter(auor => auor.latestVersion != undefined)

        const appUserIds = auors.map(auor => auor.appUser.id)

        const appUsers = (await em.find(AppUserModel, {
            id: { $in: appUserIds },
            latestVersion: { isDeleted: false }
        }, {
            populate: ['latestVersion']
        }))
            .filter(user => user.latestVersion != undefined)

        return appUsers.map(user => {
            const userv = user.latestVersion!.get(),
                auor = auors.find(auor => auor.appUser.id === user.id),
                auorv = auor!.latestVersion!.get()

            return new AppUser({
                id: user.id,
                name: userv.name,
                email: userv.email,
                isSystemAdmin: userv.isSystemAdmin,
                lastLoginDate: userv.lastLoginDate,
                creationDate: user.creationDate,
                effectiveFrom: auorv.effectiveFrom,
                isDeleted: auorv.isDeleted,
                role: auorv.role
            })
        })
    }

    /**
     * Gets a solution by id belonging to the organization
     * @param solutionId - The id of the solution to get
     * @returns The solution
     * @throws {Error} If the solution does not exist in the organization
     */
    async getSolutionById(solutionId: req.Solution['id']): Promise<req.Solution> {
        return (await this.findSolutions({ id: solutionId }))[0]
    }

    /**
     * Gets a solution by slug belonging to the organization
     * @param solutionSlug - The slug of the solution to get
     * @returns The solution
     * @throws {Error} If the solution does not exist in the organization
     * @throws {Error} If the solution does not exist
     */
    async getSolutionBySlug(solutionSlug: req.Solution['slug']): Promise<req.Solution> {
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
    async getSolutionRequirementById<RCons extends typeof req.Requirement>(props: {
        id: req.Requirement['id'],
        solutionId: req.Solution['id'],
        ReqClass: RCons,
    }): Promise<InstanceType<RCons>> {
        const requirement = (await this.findSolutionRequirementsByType({
            solutionId: props.solutionId,
            ReqClass: props.ReqClass,
            query: { id: props.id } as Partial<InstanceType<RCons>>
        }))[0]

        if (!requirement)
            throw new Error('Requirement does not exist in the organization nor the solution')

        return requirement
    }

    /**
     * Checks if the solution has the specified requirement
     * @param props.solutionId - The id of the solution
     * @param props.id - The id of the requirement
     * @returns Whether the organization has the requirement
     */
    async solutionHasRequirement(props: {
        solutionId: req.Solution['id'],
        id: req.Requirement['id']
    }): Promise<boolean> {
        const em = this._fork()

        const reqInSolution = (await em.findOne(BelongsModel, {
            left: { id: props.id },
            right: props.solutionId,
            latestVersion: { isDeleted: false }
        }, {
            populate: ['latestVersion']
        }))

        return reqInSolution != undefined && reqInSolution.latestVersion != undefined
    }

    /**
     * Updates the role of an app user in the organization
     * @param props - The properties of the app user organization role to update
     * @throws {Error} If the app user organization role does not exist
     */
    async updateAppUserRole(props: Pick<AppUserOrganizationRole, 'appUserId' | 'role'> & UpdationInfo): Promise<void> {
        const existingAuor = await this.getAppUserOrganizationRole(props.appUserId)

        if (existingAuor.role === props.role)
            return

        const em = this._fork()

        em.create(AppUserOrganizationRoleVersionsModel, {
            isDeleted: false,
            effectiveFrom: props.modifiedDate,
            modifiedBy: props.modifiedById,
            role: props.role,
            appUserOrganizationRole: await em.findOneOrFail(AppUserOrganizationRoleModel, {
                appUser: props.appUserId,
                organization: await this.getOrganization()
            })
        })

        await em.flush()
    }

    /**
     * Updates a requirement by id
     * @param props.solutionId - The id of the solution the requirement belongs to
     * @param props.requirementId - The id of the requirement to update
     * @param props.ReqClass - The Constructor of the requirement to update
     * @param props.reqProps - The properties of the requirement to update
     * @param props.modifiedById - The id of the user updating the requirement
     * @param props.modifiedDate - The effective date of the update
     * @throws {Error} If the requirement does not exist
     * @throws {Error} If the requirement does not belong to the solution
     * @throws {Error} If the solution does not exist
     */
    async updateSolutionRequirement<RCons extends typeof req.Requirement>(props: UpdationInfo & {
        solutionId: req.Solution['id'],
        requirementId: req.Requirement['id'],
        ReqClass: RCons,
        reqProps: Omit<Partial<InstanceType<RCons>>, 'id' | 'reqId' | keyof AuditMetadata>
    }): Promise<void> {
        const em = this._fork()

        const existingSolution = await this.getSolutionById(props.solutionId)

        const existingReq = await em.findOneOrFail<reqModels.RequirementModel, 'latestVersion'>(
            reqModels[`${props.ReqClass.name}Model` as keyof typeof reqModels], {
            id: props.requirementId,
            latestVersion: { isDeleted: false }
        }, {
            populate: ['latestVersion']
        })

        if (!existingReq.latestVersion)
            throw new Error(`Requirement does not exist with id ${props.requirementId}`)

        const rel = await em.findOneOrFail(BelongsModel, {
            left: props.requirementId,
            right: existingSolution.id,
            latestVersion: { isDeleted: false }
        }, {
            populate: ['latestVersion']
        })

        if (!rel.latestVersion)
            throw new Error(`Requirement does not belong to solution with id ${props.solutionId}`)

        const existingReqv = existingReq.latestVersion.get()

        em.create<reqModels.RequirementVersionsModel>(
            reqModels[`${props.ReqClass.name}VersionsModel` as keyof typeof reqModels], {
            ...existingReqv,
            ...props.reqProps,
            effectiveFrom: props.modifiedDate,
            modifiedBy: props.modifiedById,
            isDeleted: false
        })

        await em.flush()
    }


    /**
     * Updates a solution by slug
     * @param props.slug - The slug of the solution to update
     * @param props - The properties to update
     * @throws {Error} If the solution does not exist
     * @throws {Error} If the solution does not belong to the organization
     */
    async updateSolutionBySlug(slug: req.Solution['slug'], props: Pick<Partial<req.Solution>, 'name' | 'description'> & UpdationInfo): Promise<void> {
        const em = this._fork(),
            solution = await this.getSolutionBySlug(slug)

        em.create(reqModels.SolutionVersionsModel, {
            isDeleted: false,
            effectiveFrom: props.modifiedDate,
            isSilence: false,
            slug: props.name ? slugify(props.name) : solution.slug,
            name: props.name ?? solution.name,
            description: props.description ?? solution.description,
            modifiedBy: props.modifiedById,
            requirement: await em.findOneOrFail(reqModels.SolutionModel, { id: solution.id })
        })

        await em.flush()
    }

    /**
     * Updates an organization
     * @param props - The properties to update
     * @throws {Error} If the organization does not exist
     */
    async updateOrganization(props: Pick<Partial<req.Organization>, 'name' | 'description'> & UpdationInfo): Promise<void> {
        const em = this._fork(),
            organization = await this.getOrganization()

        em.create(reqModels.OrganizationVersionsModel, {
            isDeleted: false,
            effectiveFrom: props.modifiedDate,
            isSilence: false,
            slug: props.name ? slugify(props.name) : organization.slug,
            name: props.name ?? organization.name,
            description: props.description ?? organization.description,
            modifiedBy: props.modifiedById,
            requirement: await em.findOneOrFail(reqModels.OrganizationModel, { id: organization.id })
        })

        await em.flush()
    }
}