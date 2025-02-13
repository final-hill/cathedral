import { Organization } from "~/domain/requirements";
import { Repository } from "./Repository";
import { OrganizationRepository } from "./OrganizationRepository";
import { AppUserModel, AppUserOrganizationRoleModel, AppUserOrganizationRoleVersionsModel, OrganizationModel, OrganizationVersionsModel } from "../models";
import { DataModelToDomainModel, ReqQueryToModelQuery } from "../mappers";
import { slugify } from "~/shared/utils";
import { v7 as uuid7 } from 'uuid'
import { type CreationInfo } from "./CreationInfo";
import { type DeletionInfo } from "./DeletionInfo";
import { AppUser, AppUserOrganizationRole } from "~/domain/application";
import { DuplicateEntityException, NotFoundException } from "~/domain/exceptions";

export class OrganizationCollectionRepository extends Repository<Organization> {

    /**
     * Associates an app user with the organization with the specified role
     * @param auor.appUserId - The id of the app user
     * @param auor.organizationId - The id of the organization
     * @param auor.role - The role of the app user in the organization
     * @throws {DuplicateEntityException} If the app user organization role already exists
     */
    async addAppUserOrganizationRole(auor: Pick<AppUserOrganizationRole, 'appUserId' | 'role' | 'organizationId'> & CreationInfo): Promise<void> {
        const em = this._fork(),
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
     * Creates a new organization
     * @param props.name - The name of the organization
     * @param props.description - The description of the organization
     * @param props.userId - The id of the user creating the organization
     * @param props.effectiveDate - The effective date of the organization
     * @returns The id of the organization
     * @throws {DuplicateEntityException} If the organization already exists
     */
    async createOrganization(props: Pick<Organization, 'name' | 'description'> & CreationInfo): Promise<Organization['id']> {
        const em = this._fork(),
            latestVersion = await em.findOne(OrganizationVersionsModel, {
                slug: slugify(props.name),
                isDeleted: false
            }, { populate: ['requirement'], orderBy: { effectiveFrom: 'desc' } }),
            existingOrgStatic = latestVersion?.requirement

        if (latestVersion)
            throw new DuplicateEntityException('Organization already exists with the same name')

        const newId = uuid7()

        em.create(OrganizationVersionsModel, {
            isDeleted: false,
            effectiveFrom: props.effectiveDate,
            isSilence: false,
            slug: slugify(props.name),
            name: props.name,
            description: props.description,
            modifiedBy: props.createdById,
            requirement: existingOrgStatic ?? em.create(OrganizationModel, {
                id: newId,
                createdBy: props.createdById,
                creationDate: props.effectiveDate
            })
        })

        await em.flush()

        return newId
    }

    /**
     * Deletes the specified organization
     * @param props.deletedById - The id of the user deleting the organization
     * @throws {NotFoundException} If the organization does not exist
     */
    async deleteOrganization(props: Pick<Organization, 'id'> & DeletionInfo): Promise<void> {
        const em = this._fork(),
            orgRepo = new OrganizationRepository({
                config: this._config,
                organizationId: props.id
            }),
            { id, slug, name, description } = await orgRepo.getOrganization(),
            existingOrg = await em.findOne(OrganizationModel, { id })

        if (!existingOrg)
            throw new NotFoundException('Organization does not exist')

        em.create(OrganizationVersionsModel, {
            isDeleted: true,
            effectiveFrom: props.deletedDate,
            isSilence: false,
            slug,
            name,
            description,
            modifiedBy: props.deletedById,
            requirement: existingOrg
        })

        // delete all AppUserOrganizationRoles associated with the organization
        const orgUsers = await orgRepo.getOrganizationAppUsers()

        await Promise.all(orgUsers.map(user => orgRepo.deleteAppUserOrganizationRole({
            appUserId: user.id,
            organizationId: id,
            deletedById: props.deletedById,
            deletedDate: props.deletedDate
        })))

        // delete all solutions associated with the organization
        const orgSolutions = await orgRepo.findSolutions({})

        await Promise.all(orgSolutions.map(sol => orgRepo.deleteSolutionBySlug({
            deletedById: props.deletedById,
            slug: sol.slug,
            deletedDate: props.deletedDate
        })))

        await em.flush()
    }

    /**
     * Finds organizations that match the query parameters
     * @param query - The query parameters to filter organizations by
     * @returns The organizations that match the query parameters
     */
    async findOrganizations(query: Partial<Organization>): Promise<Organization[]> {
        const em = this._fork(),
            modelQuery = Object.entries(await new ReqQueryToModelQuery().map(query)),
            organizations = (await em.find(OrganizationModel, {
                ...(query.id ? { id: query.id } : {})
            })).filter(async org => {
                const latestVersion = await org.latestVersion

                return latestVersion != undefined &&
                    modelQuery.every(
                        ([key, value]) => (latestVersion as any)[key] === value
                    )
            })

        return Promise.all(
            organizations.map(async org => new Organization(await new DataModelToDomainModel().map(org)))
        )
    }

    /**
     * Gets all organizations
     * @returns The organizations
     */
    async getAllOrganizations(): Promise<Organization[]> {
        const em = this._fork()

        const organizations = (await em.find(OrganizationModel, {}))
            .filter(async org => (await org.latestVersion) != undefined)

        return Promise.all(
            organizations.map(async org => new Organization(await new DataModelToDomainModel().map(org)))
        )
    }

    /**
     * Returns the AppUserOrganizationRole for the given app user and organization
     * @param props.userId - The id of the app user
     * @param props.organizationId - The id of the organization
     * @returns The AppUserOrganizationRole
     * @throws {NotFoundException} If the app user organization role does not exist
     */
    async getAppUserOrganizationRole({ organizationId, userId }: { organizationId: Organization['id'], userId: AppUser['id'] }): Promise<AppUserOrganizationRole> {
        const em = this._fork()

        const auor = await em.findOne(AppUserOrganizationRoleModel, {
            appUser: userId,
            organization: organizationId
        }),
            auorv = await auor?.latestVersion

        if (!auor || !auorv)
            throw new NotFoundException('App user organization role does not exist')

        return new AppUserOrganizationRole({
            appUserId: userId,
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
     * Get an organization user by id
     *
     * @param props.userId The id of the app user to get
     * @param props.organizationId The id of the organization
     * @returns The app user
     * @throws {NotFoundException} If the organization does not exist
     * @throws {NotFoundException} If the app user does not exist in the organization
     */
    async getOrganizationAppUserById({ organizationId, userId }: { organizationId: Organization['id'], userId: AppUser['id'] }): Promise<AppUser> {
        const em = this._fork()

        const auor = await em.findOne(AppUserOrganizationRoleModel, {
            appUser: userId,
            organization: organizationId
        }),
            auorv = await auor?.latestVersion

        if (!auor || !auorv)
            throw new NotFoundException('App user does not exist in the organization')

        const user = await em.findOne(AppUserModel, { id: userId }),
            userv = await user?.latestVersion

        if (!user || !userv)
            throw new NotFoundException('App user does not exist')

        return new AppUser({
            id: userId,
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
}