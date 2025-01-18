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

// TODO: This is an Adapter.
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

// TODO: This is an Adapter.
/**
 * Converts a data model to a domain model
 * @param model - The data model to convert
 * @returns The domain model
 */
const dataModelToDomainModel = <M extends reqModels.RequirementModel, R extends Requirement>(model: M): R => {
    const staticProps = Object.entries(model).reduce((acc, [key, value]) => {
        if (typeof value === 'object' && value !== null && 'id' in value)
            return { ...acc, [`${key}Id`]: value.id }
        else if (key === 'versions')
            return acc // skip
        else
            return { ...acc, [key]: value }
    }, {})

    const version = model.versions[0]

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

        return solutionModels.map(sol => new Solution(dataModelToDomainModel(sol)))
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
    async findSolutionRequirementsByType<RCons extends typeof Requirement>(props: {
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

        const requirementModels = (await em.find<reqModels.RequirementModel, 'versions'>((reqModels as any)[`${props.ReqClass.name} Model`], {
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
                    ...reqQueryToModelQuery(props.query)
                }
            }
        }))
            .filter(req => req.versions.length > 0)

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
    async getAppUserOrganizations(appUserId: AppUser['id']): Promise<Organization[]> {
        const em = this._fork()

        const auors = (await em.find(AppUserOrganizationRoleModel, {
            appUser: appUserId
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
        }))
            .filter(auor => auor.versions.length > 0)

        const organizationIds = auors.map(auor => auor.organization.id)

        const organizations = await em.find(reqModels.OrganizationModel, {
            id: { $in: organizationIds }
        }, {
            populate: ['versions'],
            populateFilter: {
                versions: {
                    effectiveFrom: {
                        $eq: raw(`(SELECT MAX(effective_from)
                            FROM requirement_versions
                            WHERE requirement_id = organization.id AND effective_from <= now())`)
                    },
                    isDeleted: false
                }
            }
        })

        return organizations.map(org => new Organization(dataModelToDomainModel(org)))
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
        const em = this._fork()

        const organizations = (await em.find(reqModels.OrganizationModel, {}, {
            populate: ['versions'],
            populateFilter: {
                versions: {
                    effectiveFrom: {
                        $eq: raw(`(SELECT MAX(effective_from)
                            FROM requirement_versions
                            WHERE requirement_id = organization.id AND effective_from <= now())`)
                    },
                    isDeleted: false
                }
            }
        }))
            .filter(org => org.versions.length > 0)

        return organizations.map(org => new Organization(dataModelToDomainModel(org)))
    }

    /**
     * Gets an organization by id or slug
     * @returns The organization
     * @throws {Error} If the organization does not exist
     */
    private async _getOrganization(): Promise<Organization> {
        const em = this._fork();

        const organizationId = this._organizationId,
            organizationSlug = this._organizationSlug

        if (!organizationId && !organizationSlug)
            throw new Error('Organization id or slug must be provided')

        const result = await em.findOne(reqModels.OrganizationModel, {
            ...(organizationId ? { id: organizationId } : {}),
            ...(organizationSlug ? { slug: organizationSlug } : {})
        }, {
            populate: ['versions'],
            populateFilter: {
                versions: {
                    effectiveFrom: {
                        $eq: raw(`(SELECT MAX(effective_from)
                            FROM requirement_versions
                            WHERE requirement_id = organization.id AND effective_from <= now())`)
                    },
                    isDeleted: false
                }
            }
        })

        if (!result)
            throw new Error('Organization does not exist')

        return new Organization(dataModelToDomainModel(result))
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
            throw new Error('App user does not exist in the organization')

        const auorv = auor.versions[0]

        const user = await em.findOne(AppUserModel, {
            id
        }, {
            populate: ['versions'],
            populateFilter: {
                versions: {
                    effectiveFrom: {
                        $eq: raw(`(SELECT MAX(effective_from)
                            FROM app_user_versions
                            WHERE app_user_id = app_user.id AND effective_from <= now())`)
                    },
                    isDeleted: false
                }
            }
        })

        if (!user || !user.versions[0])
            throw new Error('App user does not exist')

        const userv = user.versions[0]

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
    async getNextReqId<R extends typeof Requirement>(solutionId: Solution['id'], prefix: R['reqIdPrefix']): Promise<InstanceType<R>['reqId']> {
        const em = this._fork()

        const reqsBelongingToSolution = (await em.find(BelongsModel, {
            right: solutionId
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

        if (reqsBelongingToSolution.length === 0)
            return `${prefix}1`

        const reqs = (await em.find(reqModels.RequirementModel, {
            id: { $in: reqsBelongingToSolution }
        }, {
            populate: ['versions'],
            populateFilter: {
                versions: {
                    reqId: {
                        $like: `${prefix}%`
                    },
                    effectiveFrom: {
                        $eq: raw(`(SELECT MAX(effective_from)
                            FROM requirement_versions
                            WHERE requirement_id = requirement.id AND effective_from <= now())`)
                    },
                    isDeleted: false
                }
            }
        }))
            .filter(req => req.versions.length > 0)
            .map(req => req.versions[0].reqId)

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
        }))
            .filter(auor => auor.versions.length > 0)

        const appUserIds = auors.map(auor => auor.appUser.id)

        const appUsers = (await em.find(AppUserModel, {
            id: { $in: appUserIds }
        }, {
            populate: ['versions'],
            populateFilter: {
                versions: {
                    effectiveFrom: {
                        $eq: raw(`(SELECT MAX(effective_from)
                            FROM app_user_versions
                            WHERE app_user_id = app_user.id AND effective_from <= now())`)
                    },
                    isDeleted: false
                }
            }
        }))
            .filter(user => user.versions.length > 0)

        return appUsers.map(user => {
            const userv = user.versions[0]

            const auor = auors.find(auor => auor.appUser.id === user.id)
            const auorv = auor!.versions[0]

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
        id: Requirement['id'],
        solutionId: Solution['id'],
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
     * Deletes the organization
     * @param props.deletedById - The id of the user deleting the organization
     * @throws {Error} If the organization does not exist
     */
    async deleteOrganization(props: {
        deletedById: AppUser['id']
    }): Promise<void> {
        const em = this._fork(),
            { id, slug, name, description } = await this.getOrganization(),
            effectiveDate = new Date()

        em.create(reqModels.OrganizationVersionsModel, {
            isDeleted: true,
            effectiveFrom: effectiveDate,
            isSilence: false,
            slug,
            name,
            description,
            modifiedBy: props.deletedById,
            requirement: await em.findOneOrFail(reqModels.OrganizationModel, { id })
        })

        // delete all roles associated with the organization by creating a new version with isDeleted set to true
        const orgUsers = await this.getOrganizationAppUsers()

        for (const user of orgUsers) {
            em.create(AppUserOrganizationRoleVersionsModel, {
                isDeleted: true,
                effectiveFrom: effectiveDate,
                role: user.role,
                modifiedBy: props.deletedById,
                appUserOrganizationRole: await em.findOneOrFail(AppUserOrganizationRoleModel, {
                    appUser: user.id,
                    organization: id
                })
            })
        }

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
    async deleteSolutionBySlug(props: {
        deletedById: AppUser['id'],
        slug: Solution['slug']
    }): Promise<void> {
        const em = this._fork(),
            solution = await this.getSolutionBySlug(props.slug),
            effectiveDate = new Date()

        em.create(reqModels.SolutionVersionsModel, {
            isDeleted: true,
            effectiveFrom: effectiveDate,
            isSilence: false,
            slug: solution.slug,
            name: solution.name,
            description: solution.description,
            modifiedBy: solution.modifiedById,
            requirement: await em.findOneOrFail(reqModels.SolutionModel, { id: solution.id })
        })

        // delete all requirements associated with the solution by creating a new version with isDeleted set to true
        const reqIdTypesInSolution = (await em.find(BelongsModel, {
            right: solution.id
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
            .map(rel => ({
                id: rel.versions[0].requirementRelation.left.id,
                req_type: rel.versions[0].requirementRelation.left.req_type
            }))
        for (const reqIdType of reqIdTypesInSolution) {
            const req = await em.findOneOrFail<reqModels.RequirementModel, 'versions'>(
                reqModels[snakeCaseToCamelCase(reqIdType.req_type) as keyof typeof reqModels], {
                id: reqIdType.id
            }, {
                populate: ['versions'],
                populateFilter: {
                    versions: {
                        effectiveFrom: {
                            $eq: raw(`(SELECT MAX(effective_from)
                                FROM requirement_versions
                                WHERE requirement_id = requirement.id AND effective_from <= now())`)
                        },
                        isDeleted: false
                    }
                }
            })


        }

        await em.flush()

    }
}