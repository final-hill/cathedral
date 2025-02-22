import { AppRole, AppUser, AppUserOrganizationRole } from "~/domain/application";
import * as req from "~/domain/requirements";
import * as reqModels from "../models/requirements";
import { AppUserModel, AppUserOrganizationRoleModel, AppUserOrganizationRoleVersionsModel } from "../models/application";
import { BelongsModel, BelongsVersionsModel } from "../models/relations";
import { pascalCaseToSnakeCase, slugify } from "#shared/utils";
import { ReqType } from "../models/requirements/ReqType";
import { v7 as uuid7 } from 'uuid'
import { AuditMetadata } from "~/domain/AuditMetadata";
import { Repository } from "./Repository";
import { DataModelToDomainModel, ReqQueryToModelQuery } from "../mappers/index";
import { type CreationInfo } from "./CreationInfo";
import { type UpdationInfo } from "./UpdationInfo";
import { type DeletionInfo } from "./DeletionInfo";
import { DuplicateEntityException, NotFoundException, MismatchException } from "~/domain/exceptions";
import { snakeCaseToPascalCase } from "~/shared/utils/snakeCaseToPascalCase";

// TODO: parameterize the repository type
export class OrganizationRepository extends Repository<req.Organization> {
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
    constructor(options: ConstructorParameters<typeof Repository>[0] & {
        organizationId?: req.Organization['id'],
        organizationSlug?: req.Organization['slug']
    }) {
        super({ em: options.em })

        const { organizationId, organizationSlug } = options

        this._organizationId = organizationId
        this._organizationSlug = organizationSlug
        this._organization = this._getOrganization()
    }

    /**
     * Associates an app user with the organization with the specified role
     * @param auor.appUserId - The id of the app user
     * @param auor.organizationId - The id of the organization
     * @param auor.role - The role of the app user in the organization
     * @throws {DuplicateEntityException} If the app user organization role already exists
     */
    async addAppUserOrganizationRole(auor: Pick<AppUserOrganizationRole, 'appUserId' | 'role' | 'organizationId'> & CreationInfo): Promise<void> {
        const em = this._em,
            existingAuor = await em.findOne(AppUserOrganizationRoleModel, {
                appUser: auor.appUserId,
                organization: auor.organizationId
            }),
            latestVersion = await existingAuor?.latestVersion,
            existingRole = latestVersion?.role

        if (existingRole === auor.role)
            throw new DuplicateEntityException('App user organization role already exists with the same role')

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
     * Adds a new requirement to the organization
     * @param props.solutionId - The id of the solution to add the requirement to
     * @param props.ReqClass - The Constructor of the requirement to add
     * @param props.reqProps - The properties of the requirement to add
     * @param props.effectiveDate - The effective date of the requirement
     * @param props.createdById - The id of the user creating the requirement
     * @returns The id of the newly created requirement
     * @throws {NotFoundException} If the solution does not exist
     */
    async addRequirement<RCons extends typeof req.Requirement>(props: CreationInfo & {
        solutionId: req.Solution['id'],
        ReqClass: RCons,
        reqProps: Omit<InstanceType<RCons>, 'reqId' | 'id' | keyof AuditMetadata>
    }): Promise<InstanceType<RCons>['id']> {
        const em = this._em,
            newId = uuid7()

        const solution = await this.getSolutionById(props.solutionId)

        if (!solution)
            throw new NotFoundException('Solution does not exist')

        em.create<reqModels.RequirementVersionsModel>((reqModels as any)[`${props.ReqClass.name}VersionsModel`], {
            id: newId,
            isDeleted: false,
            effectiveFrom: props.effectiveDate,
            modifiedBy: props.createdById,
            // Silent requirements do not have a reqId as they are not approved to be part of the solution
            reqId: props.reqProps.isSilence ? undefined : await this.getNextReqId(props.solutionId, props.ReqClass.reqIdPrefix),
            ...props.reqProps,
            requirement: em.create<reqModels.RequirementModel>((reqModels as any)[`${props.ReqClass.name}Model`], {
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
        const em = this._em,
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
     * @throws {NotFoundException} If the app user organization role does not exist
     */
    async deleteAppUserOrganizationRole(auor: Pick<AppUserOrganizationRole, 'appUserId' | 'organizationId'> & DeletionInfo): Promise<void> {
        const em = this._em,
            organizationId = (await this.getOrganization()).id,
            existingAuor = await em.findOne(AppUserOrganizationRoleModel, {
                appUser: auor.appUserId,
                organization: organizationId
            }),
            latestVersion = await existingAuor?.latestVersion

        if (!existingAuor || !latestVersion)
            throw new NotFoundException('App user organization role does not exist')

        em.create(AppUserOrganizationRoleVersionsModel, {
            ...latestVersion,
            isDeleted: true,
            effectiveFrom: auor.deletedDate,
            modifiedBy: auor.deletedById
        })

        await em.flush()
    }

    /**
     * Deletes a solution by slug
     * @param props.deletedById - The id of the user deleting the solution
     * @param props.slug - The slug of the solution to delete
     * @throws {NotFoundException} If the solution does not exist
     * @throws {MismatchException} If the solution does not belong to the organization
     */
    async deleteSolutionBySlug(props: DeletionInfo & Pick<req.Solution, 'slug'>): Promise<void> {
        const em = this._em,
            solution = await this.getSolutionBySlug(props.slug),
            existingSolution = await em.findOne(reqModels.SolutionModel, { id: solution.id })

        if (!existingSolution)
            throw new NotFoundException('Solution does not exist')

        em.create(reqModels.SolutionVersionsModel, {
            isDeleted: true,
            effectiveFrom: props.deletedDate,
            isSilence: false,
            slug: solution.slug,
            name: solution.name,
            description: solution.description,
            modifiedBy: props.deletedById,
            requirement: existingSolution
        })

        // delete all requirements associated with the solution

        const reqIdTypesInSolution = [];
        for (const rel of await em.find(BelongsModel, {
            right: solution.id
        }, { populate: ['left'] })) {
            const latestVersion = await rel.latestVersion;
            if (latestVersion) {
                const left = latestVersion.requirementRelation.left as unknown as reqModels.RequirementModel

                reqIdTypesInSolution.push({
                    id: rel.left.id,
                    req_type: left.req_type
                });
            }
        }

        // The keys representing the requirement classes in the req module
        type RCons = keyof { [K in keyof typeof req]: typeof req[K] extends typeof req.Requirement ? K : never }

        for (const reqIdType of reqIdTypesInSolution) {
            await this.deleteSolutionRequirementById({
                id: reqIdType.id,
                deletedById: props.deletedById,
                deletedDate: props.deletedDate,
                solutionId: solution.id,
                ReqClass: req[snakeCaseToPascalCase(reqIdType.req_type) as RCons] as typeof req.Requirement
            });
        }

        await em.flush()
    }

    /**
     * Deletes a requirement belonging to a solution by id
     * @param props.deletedById - The id of the user deleting the requirement
     * @param props.effectiveDate - The effective date of the deletion
     * @param props.id - The id of the requirement to delete
     * @param props.solutionId - The id of the solution the requirement belongs to
     * @param props.ReqClass - The Constructor of the requirement to delete
     * @throws {NotFoundException} If the requirement does not exist
     * @throws {MismatchException} If the requirement does not belong to the solution
     * @throws {NotFoundException} If the solution does not exist
     */
    async deleteSolutionRequirementById<RCons extends typeof req.Requirement>(
        props: DeletionInfo & {
            id: string,
            solutionId: string,
            ReqClass: RCons
        }
    ): Promise<void> {
        // delete the requirement associated with the solution by creating a new version with isDeleted set to true
        const em = this._em

        const existingReq = await em.findOne<reqModels.RequirementModel>(
            reqModels[`${props.ReqClass.name}Model` as keyof typeof reqModels], {
            id: props.id
        }),
            existingReqLatestVersion = await existingReq?.latestVersion

        if (!existingReqLatestVersion)
            throw new NotFoundException(`Requirement does not exist with id ${props.id}`)

        // "delete" the requirement by creating a new version with isDeleted set to true
        em.create<reqModels.RequirementVersionsModel>(
            reqModels[`${props.ReqClass.name}VersionsModel` as keyof typeof reqModels], {
            ...existingReqLatestVersion,
            modifiedBy: props.deletedById,
            effectiveFrom: props.deletedDate,
            isDeleted: true
        })

        // "delete" the relation between the requirement and the solution (Belongs relation)
        const rel = await em.findOne(BelongsModel, {
            left: props.id,
            right: props.solutionId
        }),
            relLatestVersion = await rel?.latestVersion

        if (!relLatestVersion)
            throw new MismatchException(`Requirement does not belong to solution with id ${props.solutionId}`)

        em.create(BelongsVersionsModel, {
            ...relLatestVersion,
            modifiedBy: props.deletedById,
            effectiveFrom: props.deletedDate,
            isDeleted: true
        })

        // find all requirements with the same reqId prefix in the solution
        // and a suffix greater than the current requirement's suffix
        // and decrement their suffix by 1
        // TODO: lift to the interactor?
        const existingReqId = existingReqLatestVersion.reqId,
            reReqId = /([0PEGS]\.\d+\.)(\d+)/,
            [prefix, suffix] = existingReqId?.match(reReqId)?.slice(1) ?? [undefined, undefined]

        if (prefix && suffix) {
            const reqsInSolution = [];
            for (const rel of await em.find(BelongsModel, {
                left: { id: { $ne: props.id } }, // exclude the currently deleted requirement
                right: props.solutionId
            })) {
                const latestVersion = await rel.latestVersion;
                if (latestVersion) {
                    const staticRelModel = latestVersion.requirementRelation;
                    reqsInSolution.push(staticRelModel.left.id);
                }
            }

            const reqs = [];
            for (const req of await em.find<reqModels.RequirementModel>((reqModels as any)[`${props.ReqClass.name}Model`], {
                id: { $in: reqsInSolution }
            })) {
                const latestVersion = await req.latestVersion;
                if (latestVersion?.reqId?.startsWith(prefix)) {
                    const [, s] = latestVersion.reqId.match(reReqId)?.slice(1) ?? [undefined, undefined]
                    if (s && +s > +suffix)
                        reqs.push(latestVersion);
                }
            }

            for (const req of reqs) {
                const [, s] = req.reqId!.match(reReqId)?.slice(1) ?? [undefined, undefined]
                if (s) {
                    em.create<reqModels.RequirementVersionsModel>(
                        reqModels[`${props.ReqClass.name}VersionsModel` as keyof typeof reqModels], {
                        ...req,
                        reqId: `${prefix}${+s - 1}` as req.Requirement['reqId'],
                        modifiedBy: props.deletedById,
                        effectiveFrom: props.deletedDate
                    })
                }
            }
        }

        await em.flush()
    }

    /**
     * Find solutions that match the query parameters for an organization
     *
     * @param query The query parameters to filter solutions by
     * @returns The solutions that match the query parameters
     * @throws {NotFoundException} If the solution does not exist in the organization
     */
    async findSolutions(query: Partial<req.Solution>): Promise<req.Solution[]> {
        const em = this._em,
            organizationId = (await this.getOrganization()).id

        const belongsModels = []
        for (const belongs of await em.find(BelongsModel, {
            left: {
                ...(query.id ? { id: query.id } : {}),
                req_type: ReqType.SOLUTION
            },
            right: { id: organizationId, req_type: ReqType.ORGANIZATION }
        })) {
            if (await belongs.latestVersion)
                belongsModels.push((await belongs.latestVersion)!.requirementRelation.left.id)
        }

        if (belongsModels.length === 0 && query.id !== undefined)
            throw new NotFoundException('Solution does not exist in the organization')

        const modelQuery = Object.entries(await new ReqQueryToModelQuery().map(query))

        const solutionModels = []
        for (const sol of await em.find(reqModels.SolutionModel, {
            id: { $in: belongsModels },
            ...(query.createdById ? { createdBy: query.createdById } : {}),
            ...(query.creationDate ? { creationDate: query.creationDate } : {})
        })) {
            const latestVersion = await sol.latestVersion
            if (latestVersion && modelQuery.every(([key, value]) => (latestVersion as any)[key] === value))
                solutionModels.push(sol)
        }

        const solutions = [];
        for await (const sol of solutionModels) {
            const domainModel = await new DataModelToDomainModel().map(Object.assign({}, sol, await sol.latestVersion));
            solutions.push(new req.Solution(domainModel));
        }
        return solutions;
    }

    /**
     * Find app user organization roles belonging to the organization
     * @returns The app user organization roles that match the query parameters
     */
    async findAppUserOrganizationRoles({ role }: { role?: AppRole } = {}): Promise<AppUserOrganizationRole[]> {
        const em = this._em,
            organizationId = (await this.getOrganization()).id

        const auors = (await em.find(AppUserOrganizationRoleModel, {
            organization: organizationId,
            ...(role ? { role } : {})
        }))
            .filter(async auor => (await auor.latestVersion) != undefined)

        return Promise.all(auors.map(async auor => {
            const auorv = (await auor.latestVersion)!

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
        }))
    }

    /**
     * Find requirements that match the query parameters for a solution
     *
     * @param props.solutionId - The id of the solution to find the requirements for
     * @param props.ReqClass - The Constructor of the requirement to find
     * @param props.query - The query parameters to filter requirements by
     * @returns The requirements that match the query parameters
     * @throws {MismatchException} If the solution does not exist in the organization
     */
    async findSolutionRequirementsByType<RCons extends typeof req.Requirement>(props: {
        solutionId: req.Solution['id'],
        ReqClass: RCons,
        query: Partial<InstanceType<RCons>>
    }): Promise<InstanceType<RCons>[]> {
        const em = this._em

        const reqsInSolution = [];
        for (const rel of await em.find(BelongsModel, {
            left: {
                req_type: pascalCaseToSnakeCase(props.ReqClass.name) as ReqType,
                ...(props.query.id ? { id: props.query.id } : {})
            },
            right: { id: props.solutionId, req_type: ReqType.SOLUTION }
        })) {
            const latestVersion = await rel.latestVersion;
            if (latestVersion)
                reqsInSolution.push(latestVersion.requirementRelation.left.id);
        }

        if (reqsInSolution.length === 0 && props.query.id !== undefined)
            throw new MismatchException('Requirement does not exist in the solution')

        const modelQuery = Object.entries(await new ReqQueryToModelQuery().map(props.query))

        const requirementModels = [];
        for (const req of await em.find<reqModels.RequirementModel>((reqModels as any)[`${props.ReqClass.name}Model`], {
            id: { $in: reqsInSolution },
            ...(props.query.createdById ? { createdBy: props.query.createdById } : {}),
            ...(props.query.creationDate ? { creationDate: props.query.creationDate } : {})
        })) {
            const latestVersion = await req.latestVersion,
                matchesQuery = modelQuery.every(([key, value]) => (latestVersion as any)[key] === value);
            if (latestVersion != undefined && matchesQuery)
                requirementModels.push(req);
        }

        const requirements = [];
        for (const req of requirementModels) {
            const domainModel = await new DataModelToDomainModel().map(Object.assign({}, req, await req.latestVersion));
            requirements.push(new props.ReqClass(domainModel));
        }

        return requirements as InstanceType<RCons>[];
    }

    /**
     * Returns the AppUserOrganizationRole for the given app user and organization
     * @param props.appUserId - The id of the app user
     * @returns The AppUserOrganizationRole
     * @throws {NotFoundException} If the app user organization role does not exist
     */
    async getAppUserOrganizationRole(appUserId: AppUser['id']): Promise<AppUserOrganizationRole> {
        const organizationId = (await this.getOrganization()).id,
            em = this._em

        const auor = await em.findOne(AppUserOrganizationRoleModel, {
            appUser: appUserId,
            organization: organizationId
        }),
            auorv = await auor?.latestVersion

        if (!auor || !auorv)
            throw new NotFoundException('App user organization role does not exist')

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
     * Gets the organization
     * @returns The organization
     */
    async getOrganization(): Promise<req.Organization> {
        return this._organization
    }

    /**
     * Gets an organization by id or slug
     * @returns The organization
     * @throws {NotFoundException} If the organization does not exist
     */
    private async _getOrganization(): Promise<req.Organization> {
        const em = this._em;

        const organizationId = this._organizationId,
            organizationSlug = this._organizationSlug

        if (!organizationId && !organizationSlug)
            throw new NotFoundException('Organization id or slug must be provided')

        const tempResult = await em.findOne(reqModels.OrganizationVersionsModel, {
            requirement: {
                ...organizationId ? { id: organizationId } : {},
            },
            ...(organizationSlug ? { slug: organizationSlug } : {})
        }, {
            populate: ['requirement'],
            orderBy: { effectiveFrom: 'desc' }
        }),
            result = tempResult?.requirement,
            latestVersion = await result?.latestVersion as reqModels.OrganizationVersionsModel | undefined

        if (!result || !latestVersion)
            throw new NotFoundException('Organization does not exist')

        if (organizationSlug && latestVersion.slug !== organizationSlug)
            throw new NotFoundException('Organization does not exist')

        return new req.Organization(await new DataModelToDomainModel().map(Object.assign({}, result, latestVersion)))
    }

    /**
     * Get an organization user by id
     *
     * @param props.id The id of the app user to get
     * @returns The app user
     * @throws {NotFoundException} If the organization does not exist
     * @throws {NotFoundException} If the app user does not exist in the organization
     */
    async getOrganizationAppUserById(id: AppUser['id']): Promise<AppUser> {
        const em = this._em,
            organizationId = (await this.getOrganization()).id

        const auor = await em.findOne(AppUserOrganizationRoleModel, {
            appUser: id,
            organization: organizationId
        }),
            auorv = await auor?.latestVersion

        if (!auor || !auorv)
            throw new NotFoundException('App user does not exist in the organization')

        const user = await em.findOne(AppUserModel, { id }),
            userv = await user?.latestVersion

        if (!user || !userv)
            throw new NotFoundException('App user does not exist')

        return new AppUser({
            id,
            name: userv.name,
            email: userv.email,
            isSystemAdmin: userv.isSystemAdmin,
            lastLoginDate: userv.lastLoginDate,
            creationDate: user.creationDate,
            lastModified: auorv.effectiveFrom,
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
     * @throws {NotFoundException} If the solution does not exist
     */
    async getNextReqId<R extends typeof req.Requirement>(solutionId: req.Solution['id'], prefix: R['reqIdPrefix']): Promise<InstanceType<R>['reqId']> {
        const em = this._em,
            solution = await this.getSolutionById(solutionId)

        const reqsInSolution = [];
        for (const rel of await em.find(BelongsModel, { right: solution.id })) {
            const latestVersion = await rel.latestVersion;
            if (latestVersion) {
                const staticRelModel = latestVersion.requirementRelation;
                reqsInSolution.push(staticRelModel.left.id);
            }
        }

        if (reqsInSolution.length === 0)
            return `${prefix}1`

        const reqs = [];
        for (const req of await em.find(reqModels.RequirementModel, {
            id: { $in: reqsInSolution }
        })) {
            const latestVersion = await req.latestVersion;
            if (latestVersion?.reqId?.startsWith(prefix))
                reqs.push(latestVersion.reqId);
        }

        const count = reqs.length

        if (count === 0)
            return `${prefix}1`

        return `${prefix}${count + 1}`
    }

    /**
     * Gets all AppUsers for the organization
     * @returns The AppUsers for the organization
     */
    async getOrganizationAppUsers(): Promise<AppUser[]> {
        const em = this._em,
            organizationId = (await this.getOrganization()).id

        const auors = (await em.find(AppUserOrganizationRoleModel, {
            organization: organizationId
        }))
            .filter(async auor => (await auor.latestVersion) != undefined)

        const appUserIds = auors.map(auor => auor.appUser.id)

        const appUsers = (await em.find(AppUserModel, {
            id: { $in: appUserIds }
        }))
            .filter(async user => (await user.latestVersion) != undefined)

        return Promise.all(appUsers.map(async user => {
            const userv = (await user.latestVersion)!,
                auor = auors.find(auor => auor.appUser.id === user.id),
                auorv = (await auor!.latestVersion)!

            return new AppUser({
                id: user.id,
                name: userv.name,
                email: userv.email,
                isSystemAdmin: userv.isSystemAdmin,
                lastLoginDate: userv.lastLoginDate,
                creationDate: user.creationDate,
                lastModified: auorv.effectiveFrom,
                isDeleted: auorv.isDeleted,
                role: auorv.role
            })
        }))
    }

    /**
     * Gets a solution by id belonging to the organization
     * @param solutionId - The id of the solution to get
     * @returns The solution
     * @throws {NotFoundException} If the solution does not exist in the organization
     */
    async getSolutionById(solutionId: req.Solution['id']): Promise<req.Solution> {
        return (await this.findSolutions({ id: solutionId }))[0]
    }

    /**
     * Gets a solution by slug belonging to the organization
     * @param solutionSlug - The slug of the solution to get
     * @returns The solution
     * @throws {NotFoundException} If the solution does not exist in the organization
     */
    async getSolutionBySlug(solutionSlug: req.Solution['slug']): Promise<req.Solution> {
        const solutions = (await this.findSolutions({ slug: solutionSlug }))

        if (solutions.length === 0)
            throw new NotFoundException('Solution does not exist in the organization')

        return solutions[0]
    }

    /**
     * Gets a requirement by id belonging to the organization solution
     * @param props.id - The id of the requirement to get
     * @param props.ReqClass - The class of the requirement to get
     * @param props.solutionId - The id of the solution to get the requirement from
     * @returns The requirement
     * @throws {NotFoundException} If the requirement does not exist in the organization nor the solution
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
            throw new NotFoundException('Requirement does not exist in the organization nor the solution')

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
        const em = this._em

        const reqInSolution = (await em.findOne(BelongsModel, {
            left: { id: props.id },
            right: props.solutionId
        })),
            latestVersion = await reqInSolution?.latestVersion

        return reqInSolution != undefined && latestVersion != undefined
    }

    /**
     * Updates the role of an app user in the organization
     * @param props - The properties of the app user organization role to update
     * @throws {NotFoundException} If the app user organization role does not exist
     */
    async updateAppUserRole(props: Pick<AppUserOrganizationRole, 'appUserId' | 'role'> & UpdationInfo): Promise<void> {
        const existingAuor = await this.getAppUserOrganizationRole(props.appUserId),
            organizationId = (await this.getOrganization()).id

        if (existingAuor.role === props.role)
            return

        const em = this._em

        em.create(AppUserOrganizationRoleVersionsModel, {
            isDeleted: false,
            effectiveFrom: props.modifiedDate,
            modifiedBy: props.modifiedById,
            role: props.role,
            appUserOrganizationRole: await em.findOneOrFail(AppUserOrganizationRoleModel, {
                appUser: props.appUserId,
                organization: organizationId
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
     * @throws {NotFoundException} If the requirement does not exist
     * @throws {MismatchException} If the requirement does not belong to the solution
     * @throws {NotFoundException} If the solution does not exist
     */
    async updateSolutionRequirement<RCons extends typeof req.Requirement>(props: UpdationInfo & {
        solutionId: req.Solution['id'],
        requirementId: req.Requirement['id'],
        ReqClass: RCons,
        reqProps: Omit<Partial<InstanceType<RCons>>, 'id' | 'reqId' | keyof AuditMetadata>
    }): Promise<void> {
        const em = this._em

        const existingSolution = await this.getSolutionById(props.solutionId)

        const existingReq = await em.findOne<reqModels.RequirementModel>(
            reqModels[`${props.ReqClass.name}Model` as keyof typeof reqModels], {
            id: props.requirementId
        }),
            existingReqv = await existingReq?.latestVersion

        if (!existingReqv)
            throw new NotFoundException(`Requirement does not exist with id ${props.requirementId}`)

        const rel = await em.findOne(BelongsModel, {
            left: props.requirementId,
            right: existingSolution.id
        }),
            relLatestVersion = await rel?.latestVersion

        if (!relLatestVersion)
            throw new MismatchException(`Requirement does not belong to solution with id ${props.solutionId}`)

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
     * @throws {NotFoundException} If the solution does not belong to the organization
     */
    async updateSolutionBySlug(slug: req.Solution['slug'], props: Pick<Partial<req.Solution>, 'name' | 'description'> & UpdationInfo): Promise<void> {
        const em = this._em,
            solution = await this.getSolutionBySlug(slug),
            existingSolution = await em.findOne(reqModels.SolutionModel, { id: solution.id })

        if (!existingSolution)
            throw new NotFoundException('Solution does not exist')

        em.create(reqModels.SolutionVersionsModel, {
            isDeleted: false,
            effectiveFrom: props.modifiedDate,
            isSilence: false,
            slug: props.name ? slugify(props.name) : solution.slug,
            name: props.name ?? solution.name,
            description: props.description ?? solution.description,
            modifiedBy: props.modifiedById,
            requirement: existingSolution
        })

        await em.flush()
    }
}