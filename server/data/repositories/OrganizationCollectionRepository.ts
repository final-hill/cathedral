import type { z } from 'zod'
import { Organization, DuplicateEntityException, NotFoundException, WorkflowState } from '#shared/domain'
import { slugify } from '#shared/utils'
import { Repository } from './Repository'
import { OrganizationRepository } from './OrganizationRepository'
import { OrganizationModel, OrganizationVersionsModel } from '../models'
import { DataModelToDomainModel, ReqQueryToModelQuery } from '../mappers'
import { v7 as uuid7 } from 'uuid'
import type { CreationInfo } from './CreationInfo'
import type { DeletionInfo } from './DeletionInfo'
import type { UpdationInfo } from './UpdationInfo'

export class OrganizationCollectionRepository extends Repository<z.infer<typeof Organization>> {
    /**
     * Creates a new organization
     * @param props.name - The name of the organization
     * @param props.description - The description of the organization
     * @param props.userId - The id of the user creating the organization
     * @param props.effectiveDate - The effective date of the organization
     * @returns The id of the organization
     * @throws {DuplicateEntityException} If the organization already exists that is not in a deleted state
     */
    async createOrganization(props: Pick<z.infer<typeof Organization>, 'name' | 'description'> & CreationInfo): Promise<z.infer<typeof Organization>['id']> {
        const em = this._em,
            orgRepo = new OrganizationRepository({ em, organizationSlug: slugify(props.name) }),
            existingOrg = await orgRepo.getOrganization().catch(() => undefined)

        if (existingOrg)
            throw new DuplicateEntityException('Organization already exists with the same name')

        const newId = uuid7()

        em.create(OrganizationVersionsModel, {
            requirement: em.create(OrganizationModel, {
                id: newId,
                createdById: props.createdById,
                creationDate: props.creationDate
            }),
            isDeleted: false,
            effectiveFrom: props.creationDate,
            slug: slugify(props.name),
            name: props.name,
            description: props.description,
            modifiedById: props.createdById,
            workflowState: WorkflowState.Active
        })

        await em.flush()

        return newId
    }

    /**
     * Deletes the specified organization
     * @param props.deletedById - The id of the user deleting the organization
     * @throws {NotFoundException} If the organization does not exist
     */
    async deleteOrganization(props: Pick<z.infer<typeof Organization>, 'id'> & DeletionInfo): Promise<void> {
        const em = this._em,
            orgRepo = new OrganizationRepository({ em, organizationId: props.id }),
            organization = await orgRepo.getOrganization()

        if (organization.isDeleted) {
            throw new NotFoundException('Organization has already been deleted')
        }

        const solutions = await orgRepo.findSolutions({})

        // delete all solutions associated with the organization
        for (const sol of solutions) {
            await orgRepo.deleteSolutionBySlug({
                deletedById: props.deletedById,
                slug: sol.slug,
                deletedDate: props.deletedDate
            })
        }

        const organizationModel = await em.findOne(OrganizationModel, { id: props.id })
        if (!organizationModel) {
            throw new NotFoundException('Organization does not exist')
        }

        em.create(OrganizationVersionsModel, {
            isDeleted: true,
            effectiveFrom: props.deletedDate,
            slug: organization.slug,
            name: organization.name,
            description: organization.description,
            modifiedById: props.deletedById,
            requirement: organizationModel,
            workflowState: WorkflowState.Removed
        })

        await em.flush()
    }

    /**
     * Finds organizations that match the query parameters
     * @param query - The query parameters to filter organizations by
     * @returns The organizations that match the query parameters
     */
    async findOrganizations(query: Partial<z.infer<typeof Organization>>): Promise<z.infer<typeof Organization>[]> {
        const { id, createdBy, creationDate } = query,
            effectiveDate = new Date(),
            volatileQuery = await new ReqQueryToModelQuery().map(query)

        const orgModels = await this._em.find(OrganizationModel, {
            id,
            createdById: createdBy?.id,
            creationDate
        }, { populate: ['*'] })

        const mapper = new DataModelToDomainModel(),
            organizations = await Promise.all(orgModels.map(async (org) => {
                // Get the truly latest version (including deleted versions) to check deletion status
                const latestVersion = await org.getLatestVersionIncludingDeleted(effectiveDate, volatileQuery)

                // Skip organizations that don't have a latest version or are deleted
                if (!latestVersion || latestVersion.isDeleted) {
                    return null
                }

                const combinedData = { ...org, ...latestVersion }
                const mappedData = await mapper.map(combinedData)
                return Organization.parse(mappedData)
            }))

        return organizations.filter(org => org !== null) as z.infer<typeof Organization>[]
    }

    /**
     * Updates an organization
     * @param props - The properties to update
     * @throws {NotFoundException} If the organization does not exist
     * @throws {MismatchException} If the provided name is already taken
     */
    async updateOrganizationById(id: z.infer<typeof Organization>['id'], props: Pick<Partial<z.infer<typeof Organization>>, 'name' | 'description'> & UpdationInfo): Promise<void> {
        const em = this._em,
            organization = await em.findOne(OrganizationModel, { id }),
            // Check if organization is deleted by getting the truly latest version
            latestVersionAny = await organization?.getLatestVersionIncludingDeleted(props.modifiedDate),
            // Get the latest non-deleted version for update base
            orgLatestVersion = await organization?.getLatestVersion(props.modifiedDate) as OrganizationVersionsModel | undefined

        if (!organization || !orgLatestVersion)
            throw new NotFoundException('Organization does not exist')

        // Prevent updating deleted organizations
        if (latestVersionAny?.isDeleted) {
            throw new NotFoundException('Organization has been deleted')
        }

        em.create(OrganizationVersionsModel, {
            isDeleted: false,
            effectiveFrom: props.modifiedDate,
            slug: props.name ? slugify(props.name) : orgLatestVersion.slug,
            name: props.name ?? orgLatestVersion.name,
            description: props.description ?? orgLatestVersion.description,
            modifiedById: props.modifiedById,
            requirement: organization,
            workflowState: orgLatestVersion.workflowState
        })

        await em.flush()
    }
}
