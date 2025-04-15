import { z } from "zod";
import { Organization, AppUserOrganizationRole, AppUser, DuplicateEntityException, NotFoundException, AppRole } from "#shared/domain";
import { slugify } from "#shared/utils";
import { Repository } from "./Repository";
import { OrganizationRepository } from "./OrganizationRepository";
import { AppUserOrganizationRoleModel, AppUserOrganizationRoleVersionsModel, OrganizationModel, OrganizationVersionsModel } from "../models";
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
            staticModel = await em.findOneOrFail(AppUserOrganizationRoleModel, {
                appUser: auor.appUserId,
                organization: auor.organizationId
            }),
            latestVersion = await staticModel.getLatestVersion(auor.effectiveDate),
            existingRole = latestVersion?.role

        if (existingRole === auor.role)
            throw new DuplicateEntityException('App user organization role already exists with the same role')

        em.create(AppUserOrganizationRoleVersionsModel, {
            appUserOrganizationRole: latestVersion?.appUserOrganizationRole ?? em.create(AppUserOrganizationRoleModel, {
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
            orgRepo = new OrganizationRepository({ em, organizationSlug: slugify(props.name) }),
            existingOrg = await orgRepo.getOrganization()

        if (existingOrg)
            throw new DuplicateEntityException('Organization already exists with the same name')

        const newId = uuid7()

        em.create(OrganizationVersionsModel, {
            requirement: em.create(OrganizationModel, {
                id: newId,
                createdBy: props.createdById,
                creationDate: props.effectiveDate,
            }),
            isDeleted: false,
            effectiveFrom: props.effectiveDate,
            slug: slugify(props.name),
            name: props.name,
            description: props.description,
            modifiedBy: props.createdById
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
            slug,
            name,
            description,
            modifiedBy: props.deletedById,
            requirement: existingOrg.id
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
        }, { populate: ['createdBy'] })

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
     * Returns the AppUserOrganizationRole for the given app user and organization
     * @param props.userId - The id of the app user
     * @param props.organizationId - The id of the organization
     * @returns The AppUserOrganizationRole
     * @throws {NotFoundException} If the app user organization role does not exist
     */
    async getAppUserOrganizationRole({ organizationId, userId }: { organizationId: z.infer<typeof Organization>['id'], userId: z.infer<typeof AppUser>['id'] }): Promise<z.infer<typeof AppUserOrganizationRole>> {
        const em = this._em,
            effectiveDate = new Date(),
            orgStatic = await em.findOneOrFail(OrganizationModel, {
                id: organizationId
            }, { populate: ['createdBy'] }),
            orgLatestVersion = await orgStatic.getLatestVersion(effectiveDate),
            auor = await em.findOne(AppUserOrganizationRoleModel, {
                appUser: userId,
                organization: organizationId
            }, { populate: ['appUser', 'createdBy'] }),
            auorv = await auor?.getLatestVersion(effectiveDate)

        if (!auor || !auorv)
            throw new NotFoundException('App user organization role does not exist')

        const appUser = auor.appUser,
            latestAppUser = await appUser.getLatestVersion(effectiveDate),
            createdBy = auor.createdBy,
            createdByVersion = await createdBy.getLatestVersion(effectiveDate),
            modifiedBy = auorv.modifiedBy,
            modifiedByVersion = await modifiedBy.getLatestVersion(effectiveDate)

        return AppUserOrganizationRole.parse({
            appUser: { id: appUser.id, name: latestAppUser!.name },
            organization: { id: organizationId, name: orgLatestVersion!.name },
            role: auorv.role,
            isDeleted: auorv.isDeleted,
            createdBy: { id: createdByVersion!.appUser.id, name: createdByVersion!.name },
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
        const em = this._em,
            auor = await em.findOne(AppUserOrganizationRoleModel, {
                appUser: userId,
                organization: organizationId
            }, {
                populate: ['appUser', 'createdBy']
            }),
            auorv = await auor?.getLatestVersion(new Date())

        if (!auor || !auorv)
            throw new NotFoundException('App user organization role does not exist')

        const appUser = auor.appUser,
            appUserv = await appUser.getLatestVersion(new Date())

        if (!appUserv)
            throw new NotFoundException('App user does not exist')

        return AppUser.parse({
            id: userId,
            name: appUserv.name,
            email: appUserv.email,
            isSystemAdmin: appUserv.isSystemAdmin,
            lastLoginDate: appUserv.lastLoginDate,
            creationDate: appUser.creationDate,
            lastModified: auorv.effectiveFrom,
            isDeleted: appUserv.isDeleted,
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
            requirement: organization
        })

        await em.flush()
    }
}