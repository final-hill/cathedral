import { z } from "zod";
import { Organization, DuplicateEntityException, NotFoundException, WorkflowState, AppUser } from "#shared/domain";
import { slugify } from "#shared/utils";
import { Repository } from "./Repository";
import { OrganizationRepository } from "./OrganizationRepository";
import { AppUserOrganizationRoleModel, OrganizationModel, OrganizationVersionsModel } from "../models";
import { DataModelToDomainModel, ReqQueryToModelQuery } from "../mappers";
import { v7 as uuid7 } from 'uuid'
import { type CreationInfo } from "./CreationInfo";
import { type DeletionInfo } from "./DeletionInfo";
import { type UpdationInfo } from "./UpdationInfo";

export class OrganizationCollectionRepository extends Repository<z.infer<typeof Organization>> {

    async addInitialAppuserOrganizationRole(props: {
        appUserId: z.infer<typeof Organization>['id'],
        organizationId: z.infer<typeof Organization>['id'],
        role: NonNullable<z.infer<typeof AppUser>['role']>
    }): Promise<void> {
        const em = this._em,
            creationDate = new Date(),
            existingAuorModel = await em.findOne(AppUserOrganizationRoleModel, {
                appUser: props.appUserId,
                organization: props.organizationId
            }),
            existingRole = existingAuorModel?.role

        if (existingAuorModel || existingRole)
            throw new DuplicateEntityException('App user organization role already exists')

        em.create(AppUserOrganizationRoleModel, {
            appUser: props.appUserId,
            organization: props.organizationId,
            createdBy: props.appUserId,
            creationDate: creationDate,
            role: props.role,
            lastModified: creationDate,
            modifiedBy: props.appUserId
        })

        await em.flush()
    }

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
                createdBy: props.createdById,
                creationDate: props.creationDate,
            }),
            isDeleted: false,
            effectiveFrom: props.creationDate,
            slug: slugify(props.name),
            name: props.name,
            description: props.description,
            modifiedBy: props.createdById,
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
            existingOrg = await orgRepo.getOrganization(),
            { slug, name, description } = existingOrg

        if (!existingOrg)
            throw new NotFoundException('Organization does not exist')

        const solutions = await orgRepo.findSolutions({})

        // delete all solutions associated with the organization
        for (const sol of solutions) {
            await orgRepo.deleteSolutionBySlug({
                deletedById: props.deletedById,
                slug: sol.slug,
                deletedDate: props.deletedDate
            });
        }

        em.create(OrganizationVersionsModel, {
            isDeleted: true,
            effectiveFrom: props.deletedDate,
            slug,
            name,
            description,
            modifiedBy: props.deletedById,
            requirement: existingOrg.id,
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
            createdBy,
            creationDate
        }, { populate: ['*'] })

        const mapper = new DataModelToDomainModel(),
            organizations = await Promise.all(orgModels.map(async org => {
                const latestVersion = await org.getLatestVersion(effectiveDate, volatileQuery);
                return Organization.parse(
                    await mapper.map({ ...org, ...latestVersion })
                );
            }))

        return organizations
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
            orgLatestVersion = await organization?.getLatestVersion(props.modifiedDate) as OrganizationVersionsModel | undefined

        if (!organization || !orgLatestVersion)
            throw new NotFoundException('Organization does not exist')

        em.create(OrganizationVersionsModel, {
            isDeleted: false,
            effectiveFrom: props.modifiedDate,
            slug: props.name ? slugify(props.name) : orgLatestVersion.slug,
            name: props.name ?? orgLatestVersion.name,
            description: props.description ?? orgLatestVersion.description,
            modifiedBy: props.modifiedById,
            requirement: organization,
            workflowState: orgLatestVersion.workflowState
        })

        await em.flush()
    }
}