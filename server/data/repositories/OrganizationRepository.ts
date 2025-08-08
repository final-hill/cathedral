import { v7 as uuid7 } from 'uuid'
import type { FilterQuery } from '@mikro-orm/core'
import { slugify } from '#shared/utils'
import { WorkflowState } from '#shared/domain'
import type { OrganizationType, SolutionType } from '#shared/domain'
import * as req from '#shared/domain/requirements'
import * as reqModels from '../models/requirements'
import { ReqType } from '#shared/domain/requirements/ReqType'
import { NotFoundException } from '#shared/domain/exceptions'
import { Repository } from './Repository'
import { DataModelToDomainModel, ReqQueryToModelQuery } from '../mappers'
import type { CreationInfo } from './CreationInfo'
import type { UpdationInfo } from './UpdationInfo'
import type { DeletionInfo } from './DeletionInfo'

// TODO: parameterize the repository type
export class OrganizationRepository extends Repository<OrganizationType> {
    private _organizationId?: OrganizationType['id']
    private _organizationSlug?: OrganizationType['slug']
    /** This is not readonly because it can be reassigned in {@link #deleteOrganization} */
    private _organization: Promise<OrganizationType>

    /**
     * Constructs a new OrganizationRepository instance
     *
     * @param props - The properties to utilize
     * @param props.config - The MikroORM configuration to utilize
     * @param [props.organizationId] - The id of the organization to utilize
     * @param [props.organizationSlug] - The slug of the organization to utilize
     */
    constructor(options: ConstructorParameters<typeof Repository>[0] & ({
        organizationId?: OrganizationType['id']
        organizationSlug?: OrganizationType['slug']
    })) {
        super({ em: options.em })

        const { organizationId, organizationSlug } = options

        this._organizationId = organizationId
        this._organizationSlug = organizationSlug
        this._organization = this._getOrganization()
    }

    /**
     * Adds a new solution to the organization
     * @param props.name - The name of the solution
     * @param props.description - The description of the solution
     * @param props.createdById - The id of the user creating the solution
     * @param props.effectiveDate - The effective date of the solution
     */
    async addSolution({ name, description, createdById, creationDate: effectiveDate }: Pick<SolutionType, 'name' | 'description'> & CreationInfo): Promise<SolutionType['id']> {
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
            modifiedById: createdById,
            workflowState: WorkflowState.Active,
            requirement: em.create(reqModels.SolutionModel, {
                id: newId,
                createdById: createdById,
                creationDate: effectiveDate
            })
        })

        await em.flush()

        return newId
    }

    /**
     * Deletes a solution by slug
     * @param props.deletedById - The id of the user deleting the solution
     * @param props.slug - The slug of the solution to delete
     * @throws {NotFoundException} If the solution does not exist in the organization
     */
    async deleteSolutionBySlug(props: DeletionInfo & Pick<SolutionType, 'slug'>): Promise<void> {
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
            throw new NotFoundException('Solution does not exist')

        const solution = solLatestVersion.requirement

        em.create(reqModels.SolutionVersionsModel, {
            isDeleted: true,
            effectiveFrom: props.deletedDate,
            slug: solLatestVersion.slug,
            name: solLatestVersion.name,
            description: solLatestVersion.description,
            modifiedById: props.deletedById,
            requirement: solution,
            organization: solLatestVersion.organization,
            workflowState: WorkflowState.Removed
        })

        /** delete all requirements associated with the solution **/
        const requirements = await this._getRequirementsInSolution(solution.id, props.deletedDate)

        for (const req of requirements) {
            em.create<reqModels.RequirementVersionsModel>(req.constructor as new () => reqModels.RequirementVersionsModel, {
                ...req,
                isDeleted: true,
                effectiveFrom: props.deletedDate,
                modifiedById: props.deletedById
            })
        }

        await em.flush()
    }

    /**
     * Find solutions that match the query parameters for an organization
     *
     * @param query The query parameters to filter solutions by
     * @returns The solutions that match the query parameters
     */
    async findSolutions(query: Partial<SolutionType>): Promise<SolutionType[]> {
        const em = this._em,
            { id, createdBy, creationDate, ...volatileQuery } = query,
            modelQuery = await new ReqQueryToModelQuery().map(volatileQuery),
            organizationId = (await this.getOrganization()).id,
            solutionModels = (await em.find(reqModels.SolutionModel, {
                id,
                createdById: createdBy?.id,
                creationDate,
                versions: {
                    $some: {
                        isDeleted: false,
                        organization: organizationId,
                        ...modelQuery
                    }
                } as FilterQuery<reqModels.SolutionVersionsModel>
            })),
            mapper = new DataModelToDomainModel(),
            solutions = await Promise.all(solutionModels.map(async (sol) => {
                const latestVersion = await sol.getLatestVersion(new Date(), modelQuery)
                return req.Solution.parse(
                    await mapper.map({ ...sol, ...latestVersion })
                )
            }))

        return solutions
    }

    /**
     * Gets the organization
     * @returns The organization
     */
    async getOrganization(): Promise<OrganizationType> {
        return this._organization
    }

    /**
     * Gets an organization by id or slug
     * @returns The organization
     * @throws {NotFoundException} If the organization does not exist
     */
    private async _getOrganization(): Promise<OrganizationType> {
        const em = this._em,
            organizationId = this._organizationId,
            organizationSlug = this._organizationSlug

        if (!organizationId && !organizationSlug)
            throw new NotFoundException('Organization id or slug must be provided')

        const tempResult = await em.findOne(reqModels.OrganizationVersionsModel, {
                requirement: {
                    ...organizationId ? { id: organizationId } : {}
                },
                ...(organizationSlug ? { slug: organizationSlug } : {})
            }, {
                populate: ['requirement'],
                orderBy: { effectiveFrom: 'desc' }
            }),
            result = tempResult?.requirement,
            latestVersion = await result?.getLatestVersion(new Date()) as reqModels.OrganizationVersionsModel

        if (!result || !latestVersion)
            throw new NotFoundException('Organization does not exist')

        if (organizationSlug && latestVersion.slug !== organizationSlug)
            throw new NotFoundException('Organization does not exist')

        const mapper = new DataModelToDomainModel(),
            dataModel = await mapper.map({ ...result, ...latestVersion })

        return req.Organization.parse(dataModel)
    }

    /*
     * Retrieves all requirements associated with a solution.
     * @param solutionId - The id of the solution
     * @param effectiveDate - The effective date to filter the requirements
     * @param prefix - The prefix of the requirement id (optional)
     * @returns An array of the latest versions of requirements associated with the solution
     */
    private async _getRequirementsInSolution(solutionId: string, effectiveDate: Date, filter: FilterQuery<Exclude<reqModels.RequirementVersionsModel, 'solution' | 'effectiveFrom'>> = {}): Promise<reqModels.RequirementVersionsModel[]> {
        const em = this._em,
            reqs = await em.find<reqModels.RequirementModel>(reqModels.RequirementModel, {
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
            ))).filter(req => req != null)

        return reqVersions
    }

    /*
     * Gets the next requirement id for the given solution and prefix
     *
     * @param solutionId - The id of the solution
     * @param prefix - The prefix for the requirement id. Ex: 'P.1.'
     * @returns The next requirement id
     * @throws {NotFoundException} If the solution does not exist
     * /
    async getNextReqId(solutionId: SolutionType['id'], prefix?: req.ReqIdPrefix): Promise<req.ReqId | undefined> {
        if (!prefix)
            return;

        const reqs = await this._getRequirementsInSolution(solutionId, new Date(), rePrefixFilter(prefix)),
            count = reqs.length;

        if (count === 0)
            return `${prefix}1`;

        return `${prefix}${count + 1}`;
    } */

    /**
     * Gets a solution by id belonging to the organization
     * @param solutionId - The id of the solution to get
     * @returns The solution
     * @throws {NotFoundException} If the solution does not exist in the organization
     */
    async getSolutionById(solutionId: SolutionType['id']): Promise<SolutionType> {
        return (await this.findSolutions({ id: solutionId }))[0]
    }

    /**
     * Gets a solution by slug belonging to the organization
     * @param solutionSlug - The slug of the solution to get
     * @returns The solution
     * @throws {NotFoundException} If the solution does not exist in the organization
     */
    async getSolutionBySlug(solutionSlug: SolutionType['slug']): Promise<SolutionType> {
        const solutions = (await this.findSolutions({ slug: solutionSlug }))

        if (solutions.length === 0)
            throw new NotFoundException('Solution does not exist in the organization')

        return solutions[0]
    }

    /**
     * Updates a solution by slug
     * @param props.slug - The slug of the solution to update
     * @param props - The properties to update
     * @throws {NotFoundException} If the solution does not belong to the organization
     */
    async updateSolutionBySlug(slug: SolutionType['slug'], props: Pick<Partial<SolutionType>, 'name' | 'description'> & UpdationInfo): Promise<void> {
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
            modifiedById: props.modifiedById,
            requirement: solution.id,
            workflowState: existingSolutionVersion.workflowState
        })

        await em.flush()
    }
}
