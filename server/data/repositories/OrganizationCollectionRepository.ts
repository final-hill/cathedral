import { z } from "zod";
import { Organization, AppUserOrganizationRole, AppUser, DuplicateEntityException, NotFoundException, AppRole } from "#shared/domain";
import { slugify } from "#shared/utils";
import { Repository } from "./Repository";
import { OrganizationRepository } from "./OrganizationRepository";
import { AppUserModel, AppUserOrganizationRoleModel, AppUserOrganizationRoleVersionsModel, OrganizationModel, OrganizationVersionsModel } from "../models";
import { DataModelToDomainModel, ReqQueryToModelQuery } from "../mappers";
import { v7 as uuid7 } from 'uuid'
import { type CreationInfo } from "./CreationInfo";
import { type DeletionInfo } from "./DeletionInfo";
import { type UpdationInfo } from "./UpdationInfo";

export class OrganizationCollectionRepository extends Repository<z.infer<typeof Organization>> {
    /**
     * Associates an app user with the organization with the specified role
     * @param auor.appUserId - The id of the app user
     * @param auor.organizationId - The id of the organization
     * @param auor.role - The role of the app user in the organization
     * @throws {DuplicateEntityException} If the app user organization role already exists
     */
    async addAppUserOrganizationRole(auor: { appUserId: string, organizationId: string, role: AppRole } & CreationInfo): Promise<void> {
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
            latestVersion = await em.findOne(OrganizationVersionsModel, {
                slug: slugify(props.name),
            }, { populate: ['requirement'], orderBy: { effectiveFrom: 'desc' } })

        if (latestVersion && !latestVersion.isDeleted)
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
            requirement: em.create(OrganizationModel, {
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
    async deleteOrganization(props: Pick<z.infer<typeof Organization>, 'id'> & DeletionInfo): Promise<void> {
        const em = this._em,
            orgRepo = new OrganizationRepository({
                em: this._em,
                organizationId: props.id
            }),
            { id, slug, name, description } = (await this.findOrganizations({ id: props.id }))[0],
            existingOrg = await em.findOne(OrganizationModel, { id }, { populate: ['createdBy'] })

        if (!existingOrg)
            throw new NotFoundException('Organization does not exist')

        // delete all solutions associated with the organization
        const orgSolutions = await orgRepo.findSolutions({})

        for (const sol of orgSolutions) {
            await orgRepo.deleteSolutionBySlug({
                deletedById: props.deletedById,
                slug: sol.slug,
                deletedDate: props.deletedDate
            });
        }

        // delete all AppUserOrganizationRoles associated with the organization
        const orgUsers = await orgRepo.getOrganizationAppUsers()

        for (const user of orgUsers) {
            await orgRepo.deleteAppUserOrganizationRole({
                appUserId: user.id,
                deletedById: props.deletedById,
                deletedDate: props.deletedDate
            });
        }

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

        await em.flush()
    }

    /**
     * Finds organizations that match the query parameters
     * @param query - The query parameters to filter organizations by
     * @returns The organizations that match the query parameters
     */
    async findOrganizations(query: Partial<z.infer<typeof Organization>>): Promise<z.infer<typeof Organization>[]> {
        const em = this._em,
            modelQuery = Object.entries(await new ReqQueryToModelQuery().map(query))

        const organizationEntities = await em.find(OrganizationModel, {
            ...(query.id ? { id: query.id } : {}),
        }, { populate: ['createdBy'] });

        const organizations: z.infer<typeof Organization>[] = []
        for (const org of organizationEntities) {
            const latestVersion = await org.latestVersion
            if (!latestVersion)
                continue

            const domainOrg = Organization.parse(await new DataModelToDomainModel().map(
                Object.assign({}, org, latestVersion)
            ))

            if (modelQuery.every(([key, value]) => (domainOrg as any)[key] === value))
                organizations.push(domainOrg)
        }

        return organizations
    }

    /**
     * Gets all organizations
     * @returns The organizations
     */
    async getAllOrganizations(): Promise<z.infer<typeof Organization>[]> {
        const em = this._em
        const organizations: z.infer<typeof Organization>[] = []

        const organizationEntities = await em.find(OrganizationModel, {})

        for await (const org of organizationEntities) {
            const latestVersion = await org.latestVersion
            if (!latestVersion)
                continue

            const domainOrg = Organization.parse(await new DataModelToDomainModel().map(
                Object.assign({}, org, latestVersion)
            ))

            organizations.push(domainOrg)
        }

        return organizations
    }

    /**
     * Returns the AppUserOrganizationRole for the given app user and organization
     * @param props.userId - The id of the app user
     * @param props.organizationId - The id of the organization
     * @returns The AppUserOrganizationRole
     * @throws {NotFoundException} If the app user organization role does not exist
     */
    async getAppUserOrganizationRole({ organizationId, userId }: { organizationId: z.infer<typeof Organization>['id'], userId: z.infer<typeof AppUser>['id'] }): Promise<z.infer<typeof AppUserOrganizationRole>> {
        const em = this._em

        const auor = await em.findOne(AppUserOrganizationRoleModel, {
            appUser: userId,
            organization: organizationId
        }, { populate: ['appUser', 'organization'] }),
            auorv = await auor?.latestVersion

        if (!auor || !auorv)
            throw new NotFoundException('App user organization role does not exist')

        const createdBy = await em.findOne(AppUserModel, { id: auor.createdBy.id }),
            createdByVersion = await createdBy?.latestVersion,
            modifiedBy = await em.findOne(AppUserModel, { id: auorv.modifiedBy.id }),
            modifiedByVersion = await modifiedBy?.latestVersion,
            appUserVersion = (await auor.appUser.latestVersion)!,
            organizationVersion = (await auor.organization.load()
                .then(org => org!.latestVersion))!

        return AppUserOrganizationRole.parse({
            appUser: { id: userId, name: appUserVersion.name },
            organization: { id: organizationId, name: organizationVersion.name },
            role: auorv.role,
            isDeleted: auorv.isDeleted,
            createdBy: { id: auor.createdBy.id, name: createdByVersion!.name },
            modifiedBy: { id: auorv.modifiedBy.id, name: modifiedByVersion!.name },
            creationDate: auor.creationDate,
            lastModified: auorv.effectiveFrom
        } as z.infer<typeof AppUserOrganizationRole>)
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
    async getOrganizationAppUserById({ organizationId, userId }: { organizationId: z.infer<typeof Organization>['id'], userId: z.infer<typeof AppUser>['id'] }): Promise<z.infer<typeof AppUser>> {
        const em = this._em

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

        return AppUser.parse({
            id: userId,
            name: userv.name,
            email: userv.email,
            isSystemAdmin: userv.isSystemAdmin,
            lastLoginDate: userv.lastLoginDate,
            creationDate: user.creationDate,
            lastModified: auorv.effectiveFrom,
            isDeleted: auorv.isDeleted,
            role: auorv.role
        } as z.infer<typeof AppUser>)
    }

    /**
     * Updates an organization
     * @param props - The properties to update
     * @throws {NotFoundException} If the organization does not exist
     * @throws {MismatchException} If the provided name is already taken
     */
    async updateOrganizationById(id: z.infer<typeof Organization>['id'], props: Pick<Partial<z.infer<typeof Organization>>, 'name' | 'description'> & UpdationInfo): Promise<void> {
        const em = this._em,
            organization = (await this.findOrganizations({ id }))[0]

        if (!organization)
            throw new NotFoundException('Organization does not exist')

        const existingOrgModel = await em.findOne(OrganizationModel, { id: organization.id })

        if (!existingOrgModel)
            throw new NotFoundException('Organization does not exist')

        em.create(OrganizationVersionsModel, {
            isDeleted: false,
            effectiveFrom: props.modifiedDate,
            isSilence: false,
            slug: props.name ? slugify(props.name) : organization.slug,
            name: props.name ?? organization.name,
            description: props.description ?? organization.description,
            modifiedBy: props.modifiedById,
            requirement: existingOrgModel
        })

        await em.flush()
    }
}