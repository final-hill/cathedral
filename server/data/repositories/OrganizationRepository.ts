import { snakeCaseToPascalCase, slugify } from "#shared/utils";
import { v7 as uuid7 } from 'uuid'
import { AuditMetadata } from "#shared/domain";
import * as req from "#shared/domain/requirements";
import * as reqModels from "../models/requirements";
import { ReqType } from "#shared/domain/requirements/ReqType";
import { reqIdPattern } from "#shared/domain/requirements/reqIdPattern";
import { AppUser, AppRole, AppUserOrganizationRole } from "#shared/domain/application";
import { NotFoundException, MismatchException } from "#shared/domain/exceptions";
import { AppUserOrganizationRoleModel, AppUserOrganizationRoleVersionsModel, AppUserVersionsModel } from "../models/application";
import { Repository } from "./Repository";
import { DataModelToDomainModel, ReqQueryToModelQuery } from "../mappers";
import { type CreationInfo } from "./CreationInfo";
import { type UpdationInfo } from "./UpdationInfo";
import { type DeletionInfo } from "./DeletionInfo";
import { z } from "zod";
import { type FilterQuery } from "@mikro-orm/core";

const rePrefixFilter = (prefix: string) => ({ reqId: new RegExp(`^${prefix}(?!0)`) })

// TODO: parameterize the repository type
export class OrganizationRepository extends Repository<z.infer<typeof req.Organization>> {
    private _organizationId?: z.infer<typeof req.Organization>['id']
    private _organizationSlug?: z.infer<typeof req.Organization>['slug']
    /** This is not readonly because it can be reassigned in {@link #deleteOrganization} */
    private _organization: Promise<z.infer<typeof req.Organization>>

    /**
     * Constructs a new OrganizationRepository instance
     *
     * @param props - The properties to utilize
     * @param props.config - The MikroORM configuration to utilize
     * @param [props.organizationId] - The id of the organization to utilize
     * @param [props.organizationSlug] - The slug of the organization to utilize
     */
    constructor(options: ConstructorParameters<typeof Repository>[0] & {
        organizationId?: z.infer<typeof req.Organization>['id'],
        organizationSlug?: z.infer<typeof req.Organization>['slug']
    }) {
        super({ em: options.em })

        const { organizationId, organizationSlug } = options

        this._organizationId = organizationId
        this._organizationSlug = organizationSlug
        this._organization = this._getOrganization()
    }

    /**
     * Adds a new requirement to the organization
     * @param props.solutionSlug - The slug of the solution to add the requirement to
     * @param props.reqProps - The properties of the requirement to add
     * @param props.effectiveDate - The effective date of the requirement
     * @param props.createdById - The id of the user creating the requirement
     * @returns The id of the newly created requirement
     * @throws {NotFoundException} If the solution does not exist
     */
    async addRequirement<R extends keyof typeof req>(props: CreationInfo & {
        solutionSlug: z.infer<typeof req.Solution>['slug'],
        reqProps: Omit<z.infer<typeof req[R]>, 'reqId' | 'id' | keyof z.infer<typeof AuditMetadata>> & {
            reqType: ReqType, reqIdPrefix: req.ReqIdPrefix | undefined
        }
    }): Promise<z.infer<typeof req.Requirement>['id']> {
        const em = this._em,
            { reqType, ...reqProps } = props.reqProps,
            ReqTypePascal = snakeCaseToPascalCase(reqType) as keyof typeof req,
            ReqModel = reqModels[`${ReqTypePascal}Model` as keyof typeof reqModels],
            ReqVersionsModel = reqModels[`${ReqTypePascal}VersionsModel` as keyof typeof reqModels]

        const solution = await this.getSolutionBySlug(props.solutionSlug)

        if (!solution)
            throw new NotFoundException('Solution does not exist')

        const { reqIdPrefix, ...mappedProps } = new ReqQueryToModelQuery().map(reqProps) as any

        const newId = uuid7()

        em.create<reqModels.RequirementVersionsModel>(ReqVersionsModel, {
            requirement: em.create<reqModels.RequirementModel>(ReqModel, {
                id: newId,
                createdBy: props.createdById,
                creationDate: props.effectiveDate
            }),
            isDeleted: false,
            effectiveFrom: props.effectiveDate,
            modifiedBy: props.createdById,
            solution: solution.id,
            reqId: await this.getNextReqId(solution.id, reqIdPrefix),
            ...mappedProps
        })

        await em.flush()

        return newId
    }

    /**
     * Adds a new solution to the organization
     * @param props.name - The name of the solution
     * @param props.description - The description of the solution
     * @param props.createdById - The id of the user creating the solution
     * @param props.effectiveDate - The effective date of the solution
     */
    async addSolution({ name, description, createdById, effectiveDate }: Pick<z.infer<typeof req.Solution>, 'name' | 'description'> & CreationInfo): Promise<z.infer<typeof req.Solution>['id']> {
        const em = this._em,
            organization = await this.getOrganization(),
            newId = uuid7()

        em.create(reqModels.SolutionVersionsModel, {
            organization: organization.id,
            isDeleted: false,
            effectiveFrom: effectiveDate,
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

        await em.flush()

        return newId
    }

    /**
     * Deletes an app user organization role
     * @param auor.appUserId - The id of the app user
     * @param auor.deletedById - The id of the user deleting the app user organization role
     * @param auor.effectiveDate - The effective date of the deletion
     * @throws {NotFoundException} If the app user organization role does not exist
     */
    async deleteAppUserOrganizationRole(auor: { appUserId: string } & DeletionInfo): Promise<void> {
        const em = this._em,
            organizationId = (await this.getOrganization()).id,
            auors = await em.findOne(AppUserOrganizationRoleModel, {
                appUser: auor.appUserId,
                organization: organizationId,
            }),
            auorv = await auors?.getLatestVersion(auor.deletedDate)

        if (!auors || !auorv)
            throw new NotFoundException('App user organization role does not exist')

        em.create(AppUserOrganizationRoleVersionsModel, {
            ...auorv,
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
     * @throws {NotFoundException} If the solution does not exist in the organization
     */
    async deleteSolutionBySlug(props: DeletionInfo & Pick<z.infer<typeof req.Solution>, 'slug'>): Promise<void> {
        const em = this._em,
            maybeSolLatestVersion = await em.findOne(reqModels.SolutionVersionsModel, {
                organization: (await this.getOrganization()).id,
                slug: props.slug,
                effectiveFrom: { $lte: props.deletedDate }
            }, {
                orderBy: { effectiveFrom: 'desc' }
            }),
            solLatestVersion = maybeSolLatestVersion?.isDeleted ? undefined : maybeSolLatestVersion

        if (!solLatestVersion)
            throw new NotFoundException('Solution does not exist');

        const solution = solLatestVersion.requirement;

        em.create(reqModels.SolutionVersionsModel, {
            isDeleted: true,
            effectiveFrom: props.deletedDate,
            slug: solLatestVersion.slug,
            name: solLatestVersion.name,
            description: solLatestVersion.description,
            modifiedBy: props.deletedById,
            requirement: solution,
            organization: solLatestVersion.organization
        });

        /*** delete all requirements associated with the solution ***/
        const requirements = await this._getRequirementsInSolution(solution.id, props.deletedDate);

        for (const req of requirements) {
            em.create<reqModels.RequirementVersionsModel>(req.constructor as any, {
                ...req,
                isDeleted: true,
                effectiveFrom: props.deletedDate,
                modifiedBy: props.deletedById
            });
        }

        await em.flush();
    }

    /**
     * Deletes a requirement belonging to a solution by id
     * @param props.deletedById - The id of the user deleting the requirement
     * @param props.deletedDate - The effective date of the deletion
     * @param props.id - The id of the requirement to delete
     * @param props.solutionId - The id of the solution the requirement belongs to
     * @param props.reqType - The type of the requirement to delete
     * @throws {NotFoundException} If the requirement does not exist in the solution
     * @throws {NotFoundException} If the solution does not exist in the organization
     */
    async deleteSolutionRequirementById(
        props: DeletionInfo & {
            id: string,
            solutionId: string,
            reqType: ReqType
        }
    ): Promise<void> {
        // delete the requirement associated with the solution by creating a new version with isDeleted set to true
        const em = this._em,
            ReqTypePascal = snakeCaseToPascalCase(props.reqType) as keyof typeof req,
            ReqModel = reqModels[`${ReqTypePascal}Model` as keyof typeof reqModels],
            ReqVersionsModel = reqModels[`${ReqTypePascal}VersionsModel` as keyof typeof reqModels]

        const existingReq = await em.findOne<reqModels.RequirementModel, 'versions'>(ReqModel, {
            id: props.id
        }),
            existingReqLatestVersion = await existingReq?.getLatestVersion(props.deletedDate)

        if (!existingReqLatestVersion)
            throw new NotFoundException(`Requirement does not exist with id ${props.id}`)

        // "delete" the requirement by creating a new version with isDeleted set to true
        em.create<reqModels.RequirementVersionsModel>(
            ReqVersionsModel, {
            ...existingReqLatestVersion,
            modifiedBy: props.deletedById,
            effectiveFrom: props.deletedDate,
            isDeleted: true
        })

        // find all requirements with the same reqId prefix in the solution and suffix greater than the current
        // requirement's suffix and decrement their suffix by 1
        // TODO: lift to the interactor?
        const existingReqId = existingReqLatestVersion.reqId,
            [prefix, suffix] = existingReqId?.match(reqIdPattern)?.slice(1) ?? [undefined, undefined]

        if (prefix && suffix) {
            const reqsInSolution = (await this._getRequirementsInSolution(props.solutionId, props.deletedDate, rePrefixFilter(prefix)))
                .filter(req => {
                    const [, s] = req.reqId?.match(reqIdPattern)?.slice(1) ?? [undefined, undefined]

                    return req.requirement.id !== props.id // exclude the currently deleted requirement;
                        && s && +s > +suffix // filter by suffix (greater than the current requirement's suffix)
                })

            // decrement the suffix of the requirements by 1
            for (const req of reqsInSolution) {
                const [, s] = req.reqId!.match(reqIdPattern)?.slice(1) ?? [undefined, undefined]
                if (s) {
                    em.create<reqModels.RequirementVersionsModel>(
                        ReqVersionsModel, {
                        ...req,
                        reqId: `${prefix}${+s - 1}` as req.ReqId,
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
     */
    async findSolutions(query: Partial<z.infer<typeof req.Solution>>): Promise<z.infer<typeof req.Solution>[]> {
        const em = this._em,
            { id, createdBy, creationDate, ...volatileQuery } = query,
            modelQuery = new ReqQueryToModelQuery().map(volatileQuery)

        const solutionModels = (await em.find(reqModels.SolutionModel, {
            id,
            createdBy,
            creationDate
        }, { populate: ['createdBy'] }));

        const mapper = new DataModelToDomainModel(),
            solutions = await Promise.all(solutionModels.map(async sol => {
                const latestVersion = await sol.getLatestVersion(new Date(), modelQuery)

                return req.Solution.parse(
                    mapper.map({ ...sol, ...latestVersion })
                )
            }));

        return solutions;
    }

    /**
     * Find app user organization roles belonging to the organization
     * @returns The app user organization roles that match the query parameters
     */
    async findAppUserOrganizationRoles({ role }: { role?: AppRole } = {}): Promise<z.infer<typeof AppUserOrganizationRole>[]> {
        const em = this._em,
            organization = await this.getOrganization()

        const auorModels = (await em.find(AppUserOrganizationRoleModel, {
            organization: organization.id
        }, {
            populate: ['createdBy']
        }))

        return Promise.all(auorModels.map(async auors => {
            const auorv = (await auors.getLatestVersion(new Date(), { role }))!,
                appUserVersionModel = await auors.appUser.getLatestVersion(auorv.effectiveFrom),
                createdByVersionModel = await auors.createdBy.getLatestVersion(auorv.effectiveFrom),
                modifiedByVersionModel = await auorv.modifiedBy.getLatestVersion(auorv.effectiveFrom)

            return AppUserOrganizationRole.parse({
                appUser: { id: auors.appUser.id, name: appUserVersionModel!.name },
                organization: { id: auors.organization.id, name: organization.name },
                role: auorv.role,
                isDeleted: auorv.isDeleted,
                createdBy: { id: auors.createdBy.id, name: createdByVersionModel!.name },
                modifiedBy: { id: auorv.modifiedBy.id, name: modifiedByVersionModel!.name },
                creationDate: auors.creationDate,
                lastModified: auorv.effectiveFrom
            } as z.infer<typeof AppUserOrganizationRole>)
        }));
    }

    /**
     * Find requirements that match the query parameters for a solution
     *
     * @param props.solutionSlug - The slug of the solution to find the requirements for
     * @param props.query - The query parameters to filter requirements by
     * @returns The requirements that match the query parameters ordered by reqId
     * @throws {MismatchException} If the solution does not exist in the organization
     */
    async findSolutionRequirements<R extends keyof typeof req>(props: {
        solutionSlug: z.infer<typeof req.Solution>['slug'],
        query: Partial<z.infer<typeof req[R]>> & { reqType: ReqType }
    }): Promise<z.infer<typeof req[R]>[]> {
        const { reqType, createdBy, creationDate, ...query } = props.query,
            modelQuery = new ReqQueryToModelQuery().map(query),
            ReqTypePascal = snakeCaseToPascalCase(reqType) as keyof typeof req,
            solution = await this.getSolutionBySlug(props.solutionSlug)

        const reqVs = (await this._getRequirementsInSolution(solution.id, new Date(), {
            ...modelQuery
        }))
            .filter(reqV => {
                const req = reqV.requirement
                return req.req_type === reqType
                    && (createdBy ? req.createdBy.id === createdBy as unknown as string : true)
                    && (creationDate ? req.creationDate === creationDate : true)
            })

        const mapper = new DataModelToDomainModel(),
            requirements = await Promise.all(reqVs.map(async r => {
                return req[ReqTypePascal].parse(
                    mapper.map({ ...r.requirement, ...r })
                )
            }));

        return requirements.sort((a, b) => {
            const aSuffix = a.reqId?.match(reqIdPattern)?.[2],
                bSuffix = b.reqId?.match(reqIdPattern)?.[2];
            return aSuffix && bSuffix ? +aSuffix - +bSuffix : 0;
        });
    }

    /**
     * Returns the AppUserOrganizationRole for the given app user and organization
     * @param props.appUserId - The id of the app user
     * @returns The AppUserOrganizationRole
     * @throws {NotFoundException} If the app user organization role does not exist
     */
    async getAppUserOrganizationRole(appUserId: z.infer<typeof AppUser>['id']): Promise<z.infer<typeof AppUserOrganizationRole>> {
        const em = this._em,
            organizationId = (await this.getOrganization()).id;

        const auor = await em.findOne(AppUserOrganizationRoleModel, {
            appUser: appUserId,
            organization: organizationId
        }, {
            populate: ['createdBy', 'appUser', 'organization']
        }),
            auorv = await auor?.getLatestVersion(new Date()) as AppUserOrganizationRoleVersionsModel | undefined;

        if (!auor || !auorv)
            throw new NotFoundException('App user organization role does not exist');

        const appUserVersion = await auor.appUser.getLatestVersion(auorv.effectiveFrom) as AppUserVersionsModel,
            createdByVersion = await auor.createdBy.getLatestVersion(auorv.effectiveFrom) as AppUserVersionsModel,
            modifiedByVersion = await auorv.modifiedBy.getLatestVersion(auorv.effectiveFrom) as AppUserVersionsModel,
            orgVersion = await auor.organization.load().then(org => org!.getLatestVersion(auorv.effectiveFrom)) as reqModels.OrganizationVersionsModel;

        return AppUserOrganizationRole.parse({
            appUser: { id: appUserId, name: appUserVersion.name },
            organization: { id: orgVersion.requirement.id, name: orgVersion.name },
            role: auorv.role,
            isDeleted: auorv.isDeleted,
            createdBy: { id: createdByVersion.appUser.id, name: createdByVersion.name },
            modifiedBy: { id: modifiedByVersion.appUser.id, name: modifiedByVersion.name },
            creationDate: auorv.appUserOrganizationRole.creationDate,
            lastModified: auorv.effectiveFrom
        } as z.infer<typeof AppUserOrganizationRole>);
    }

    /**
     * Gets the organization
     * @returns The organization
     */
    async getOrganization(): Promise<z.infer<typeof req.Organization>> {
        return this._organization
    }

    /**
     * Gets an organization by id or slug
     * @returns The organization
     * @throws {NotFoundException} If the organization does not exist
     */
    private async _getOrganization(): Promise<z.infer<typeof req.Organization>> {
        const em = this._em,
            organizationId = this._organizationId,
            organizationSlug = this._organizationSlug

        if (!organizationId && !organizationSlug)
            throw new NotFoundException('Organization id or slug must be provided')

        const tempResult = await em.findOne(reqModels.OrganizationVersionsModel, {
            requirement: {
                ...organizationId ? { id: organizationId } : {},
            },
            ...(organizationSlug ? { slug: organizationSlug } : {})
        }, {
            populate: ['requirement', 'requirement.createdBy', 'modifiedBy'],
            orderBy: { effectiveFrom: 'desc' }
        }),
            result = tempResult?.requirement,
            latestVersion = await result?.getLatestVersion(new Date()) as reqModels.OrganizationVersionsModel

        if (!result || !latestVersion)
            throw new NotFoundException('Organization does not exist')

        if (organizationSlug && latestVersion.slug !== organizationSlug)
            throw new NotFoundException('Organization does not exist')

        const dataModel = new DataModelToDomainModel().map(Object.assign({}, result, latestVersion))

        return req.Organization.parse(dataModel)
    }

    /**
     * Get an organization user by id
     *
     * @param props.id The id of the app user to get
     * @returns The app user
     * @throws {NotFoundException} If the organization does not exist
     * @throws {NotFoundException} If the app user does not exist in the organization
     */
    async getOrganizationAppUserById(id: z.infer<typeof AppUser>['id']): Promise<z.infer<typeof AppUser>> {
        const em = this._em,
            organizationId = (await this.getOrganization()).id,
            auor = await em.findOne(AppUserOrganizationRoleModel, {
                appUser: id,
                organization: organizationId
            }, {
                populate: ['appUser', 'organization']
            }),
            auorv = await auor?.getLatestVersion(new Date()) as AppUserOrganizationRoleVersionsModel | undefined;

        if (!auor || !auorv)
            throw new NotFoundException('App user does not exist in the organization');

        const appUserVersion = await auor.appUser.getLatestVersion(auorv.effectiveFrom) as AppUserVersionsModel

        return AppUser.parse({
            id,
            name: appUserVersion.name,
            email: appUserVersion.email,
            isSystemAdmin: appUserVersion.isSystemAdmin,
            lastLoginDate: appUserVersion.lastLoginDate,
            creationDate: auor.appUser.creationDate,
            lastModified: auorv.effectiveFrom,
            isDeleted: auorv.isDeleted,
            role: auorv.role
        } as z.infer<typeof AppUser>);
    }

    /**
     * Retrieves all requirements associated with a solution.
     * @param solutionId - The id of the solution
     * @param effectiveDate - The effective date to filter the requirements
     * @param prefix - The prefix of the requirement id (optional)
     * @returns An array of the latest versions of requirements associated with the solution
     */
    private async _getRequirementsInSolution(solutionId: string, effectiveDate: Date, filter: FilterQuery<Exclude<reqModels.RequirementVersionsModel, 'solution' | 'effectiveFrom'>> = {}): Promise<reqModels.RequirementVersionsModel[]> {
        const em = this._em;

        const reqs = await em.find<reqModels.RequirementModel>(reqModels.RequirementModel, {
            req_type: { $nin: [ReqType.ORGANIZATION, ReqType.SOLUTION] },
            versions: {
                $some: {
                    isDeleted: false,
                    solution: solutionId,
                    effectiveFrom: { $lte: effectiveDate },
                    ...filter
                }
            }
        }),
            reqVersions = (await Promise.all(reqs.map(req =>
                req.getLatestVersion(effectiveDate, filter)
            ))).filter(req => req != null);

        return reqVersions;
    }

    /**
     * Gets the next requirement id for the given solution and prefix
     *
     * @param solutionId - The id of the solution
     * @param prefix - The prefix for the requirement id. Ex: 'P.1.'
     * @returns The next requirement id
     * @throws {NotFoundException} If the solution does not exist
     */
    async getNextReqId(solutionId: z.infer<typeof req.Solution>['id'], prefix?: req.ReqIdPrefix): Promise<req.ReqId | undefined> {
        if (!prefix)
            return;

        const reqs = await this._getRequirementsInSolution(solutionId, new Date(), rePrefixFilter(prefix)),
            count = reqs.length;

        if (count === 0)
            return `${prefix}1`;

        return `${prefix}${count + 1}`;
    }

    /**
     * Gets all AppUsers for the organization
     * @returns The AppUsers for the organization
     */
    async getOrganizationAppUsers(): Promise<z.infer<typeof AppUser>[]> {
        const em = this._em,
            organizationId = (await this.getOrganization()).id,
            effectiveDate = new Date();

        const appUserModels = (await em.find(AppUserOrganizationRoleModel, {
            organization: organizationId
        }, { populate: ['appUser'] }))

        return Promise.all(appUserModels.map(async auor => {
            const auorv = await auor.getLatestVersion(effectiveDate),
                appUserVersionModel = await auor.appUser.getLatestVersion(auorv!.effectiveFrom)

            return AppUser.parse({
                id: auor.appUser.id,
                name: appUserVersionModel!.name,
                email: appUserVersionModel!.email,
                isSystemAdmin: appUserVersionModel!.isSystemAdmin,
                lastLoginDate: appUserVersionModel!.lastLoginDate,
                creationDate: auor.appUser.creationDate,
                lastModified: auor.versions[0].effectiveFrom,
                isDeleted: auor.versions[0].isDeleted,
                role: auor.versions[0].role
            } as z.infer<typeof AppUser>);
        }));
    }

    /**
     * Gets a solution by id belonging to the organization
     * @param solutionId - The id of the solution to get
     * @returns The solution
     * @throws {NotFoundException} If the solution does not exist in the organization
     */
    async getSolutionById(solutionId: z.infer<typeof req.Solution>['id']): Promise<z.infer<typeof req.Solution>> {
        return (await this.findSolutions({ id: solutionId }))[0]
    }

    /**
     * Gets a solution by slug belonging to the organization
     * @param solutionSlug - The slug of the solution to get
     * @returns The solution
     * @throws {NotFoundException} If the solution does not exist in the organization
     */
    async getSolutionBySlug(solutionSlug: z.infer<typeof req.Solution>['slug']): Promise<z.infer<typeof req.Solution>> {
        const solutions = (await this.findSolutions({ slug: solutionSlug }))

        if (solutions.length === 0)
            throw new NotFoundException('Solution does not exist in the organization')

        return solutions[0]
    }

    /**
     * Gets a requirement by id belonging to the organization solution
     * @param props.id - The id of the requirement to get
     * @param props.reqType - The type of the requirement to get
     * @param props.solutionSlug - The slug of the solution to get the requirement from
     * @returns The requirement
     * @throws {NotFoundException} If the requirement does not exist in the organization nor the solution
     */
    async getSolutionRequirementById<R extends keyof typeof req>(props: {
        id: z.infer<typeof req.Requirement>['id'],
        solutionSlug: z.infer<typeof req.Solution>['slug'],
        reqType: ReqType,
    }): Promise<z.infer<typeof req[R]>> {
        const requirement = (await this.findSolutionRequirements({
            solutionSlug: props.solutionSlug,
            query: { id: props.id, reqType: props.reqType, } as Partial<z.infer<typeof req[R]>> & { reqType: ReqType }
        }))[0]

        if (!requirement)
            throw new NotFoundException('Requirement does not exist in the organization nor the solution')

        return requirement
    }

    /**
     * Updates the role of an app user in the organization
     * @param props.appUserId - The id of the app user
     * @param props.role - The role of the app user in the organization
     * @throws {NotFoundException} If the app user organization role does not exist
     */
    async updateAppUserRole(props: { appUserId: string, role: AppRole } & UpdationInfo): Promise<void> {
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
     * @param props.solutionSlug - The slug of the solution the requirement belongs to
     * @param props.requirementId - The id of the requirement to update
     * @param props.reqProps - The properties of the requirement to update
     * @param props.modifiedById - The id of the user updating the requirement
     * @param props.modifiedDate - The effective date of the update
     * @throws {NotFoundException} If the requirement does not exist
     * @throws {MismatchException} If the requirement does not belong to the solution
     * @throws {NotFoundException} If the solution does not exist
     */
    async updateSolutionRequirement<R extends keyof typeof req>(props: UpdationInfo & {
        solutionSlug: z.infer<typeof req.Solution>['slug'],
        requirementId: z.infer<typeof req.Requirement>['id'],
        reqProps: Omit<Partial<z.infer<typeof req[R]>>, 'id' | keyof z.infer<typeof AuditMetadata>>
        & { reqType: ReqType }
    }): Promise<void> {
        const em = this._em,
            { reqType, reqId, ...reqProps } = props.reqProps,
            ReqType = snakeCaseToPascalCase(reqType) as keyof typeof req,
            ReqModel = reqModels[`${ReqType}Model` as keyof typeof reqModels],
            ReqVersionsModel = reqModels[`${ReqType}VersionsModel` as keyof typeof reqModels];

        const existingSolution = await this.getSolutionBySlug(props.solutionSlug),
            existingReq = await em.findOne<reqModels.RequirementModel>(ReqModel, {
                id: props.requirementId
            }),
            existingReqv = await existingReq?.getLatestVersion(props.modifiedDate)

        if (!existingReqv)
            throw new NotFoundException(`Requirement does not exist with id ${props.requirementId}`)

        const { reqIdPrefix, ...mappedProps } = new ReqQueryToModelQuery().map(reqProps);

        if (reqId && reqId !== existingReqv.reqId) {
            const [prefix, suffix] = reqId.match(reqIdPattern)?.slice(1) ?? [undefined, undefined];

            if (!prefix || !suffix || prefix !== reqIdPrefix)
                throw new MismatchException(`Invalid reqId format or prefix for reqType ${reqType}`);

            const reqs = await this._getRequirementsInSolution(existingSolution.id, props.modifiedDate, rePrefixFilter(prefix)),
                count = reqs.length;

            // The suffix of the reqId must be within the range of the existing reqIds
            if (+suffix < 1 || +suffix > count)
                throw new MismatchException(`Invalid reqId suffix for reqType ${reqType}. Must be between ${prefix}1 and ${prefix}${count}`);

            // Remove the source requirement from the array
            const sourceReqIndex = reqs.findIndex(req => req.reqId === existingReqv.reqId),
                [sourceReq] = reqs.splice(sourceReqIndex, 1);

            // Insert the source requirement at the requested position
            reqs.splice(+suffix - 1, 0, sourceReq);

            // Update the reqIds for the relevant range
            const start = Math.min(sourceReqIndex, +suffix - 1),
                end = Math.max(sourceReqIndex, +suffix - 1);

            for (let i = start; i <= end; i++) {
                const req = reqs[i];
                em.create<reqModels.RequirementVersionsModel>(
                    ReqVersionsModel, {
                    ...req,
                    reqId: `${prefix}${i + 1}` as req.ReqId,
                    modifiedBy: props.modifiedById,
                    effectiveFrom: props.modifiedDate,
                    isDeleted: false
                });
            }
        }

        em.create<reqModels.RequirementVersionsModel>(
            ReqVersionsModel, {
            ...existingReqv,
            ...mappedProps,
            effectiveFrom: props.modifiedDate,
            modifiedBy: props.modifiedById,
            isDeleted: false
        });

        await em.flush();
    }

    /**
     * Updates a solution by slug
     * @param props.slug - The slug of the solution to update
     * @param props - The properties to update
     * @throws {NotFoundException} If the solution does not belong to the organization
     */
    async updateSolutionBySlug(slug: z.infer<typeof req.Solution>['slug'], props: Pick<Partial<z.infer<typeof req.Solution>>, 'name' | 'description'> & UpdationInfo): Promise<void> {
        const em = this._em,
            organizationId = (await this.getOrganization()).id,
            solution = await this.getSolutionBySlug(slug),
            existingSolution = await em.findOne(reqModels.SolutionModel, {
                id: solution.id
            }),
            existingSolutionVersion = await existingSolution?.getLatestVersion(props.modifiedDate, {
                organization: organizationId,
                slug
            } as FilterQuery<reqModels.SolutionVersionsModel>)

        if (!existingSolutionVersion)
            throw new NotFoundException('Solution does not exist')

        em.create(reqModels.SolutionVersionsModel, {
            organization: organizationId,
            isDeleted: false,
            effectiveFrom: props.modifiedDate,
            slug: props.name ? slugify(props.name) : solution.slug,
            name: props.name ?? solution.name,
            description: props.description ?? solution.description,
            modifiedBy: props.modifiedById,
            requirement: solution.id
        })

        await em.flush()
    }
}