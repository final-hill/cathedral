import { AppUser, Organization, DuplicateEntityException, NotFoundException } from "#shared/domain";
import { Repository } from "./Repository";
import { AppUserModel, AppUserOrganizationRoleModel, AppUserVersionsModel, OrganizationModel } from "../models";
import { type CreationInfo } from "./CreationInfo";
import { type UpdationInfo } from "./UpdationInfo";
import { z } from "zod";

export class AppUserRepository extends Repository<z.infer<typeof AppUser>> {
    /**
     * Create a new app user
     * @param props - The properties of the app user
     * @returns The id of the created app user
     * @throws {DuplicateEntityException} If the user already exists
     */
    async createAppUser(props: z.infer<typeof AppUser> & CreationInfo): Promise<z.infer<typeof AppUser>['id']> {
        const em = this._em,
            existingUserStatic = await em.findOne(AppUserModel, { id: props.id }),
            latestVersion = await existingUserStatic?.latestVersion

        if (latestVersion)
            throw new DuplicateEntityException(`User with id ${props.id} already exists`)

        em.create(AppUserVersionsModel, {
            appUser: existingUserStatic ?? em.create(AppUserModel, {
                id: props.id,
                createdBy: props.createdById,
                creationDate: props.lastModified
            }),
            modifiedBy: props.createdById,
            effectiveFrom: props.lastModified,
            email: props.email,
            isDeleted: props.isDeleted,
            isSystemAdmin: props.isSystemAdmin,
            lastLoginDate: props.lastLoginDate,
            name: props.name
        })

        await em.flush()

        return props.id
    }

    /**
     * Get the app user by email.
     * Note: The 'role' will not be populated. Use the OrganizationInteractor methods if you need the associated role.
     * @param email - The email of the app user
     * @returns The app user
     * @throws {NotFoundException} If the user does not exist
     */
    async getUserByEmail(email: z.infer<typeof AppUser>['email']): Promise<z.infer<typeof AppUser>> {
        const em = this._em

        const userVersions = await em.findOne(AppUserVersionsModel, {
            email,
            isDeleted: false
        }, {
            orderBy: { effectiveFrom: 'desc' },
            populate: ['appUser']
        })
        const user = userVersions?.appUser,
            latestVersion = await userVersions?.appUser.latestVersion

        if (!user || !latestVersion)
            throw new NotFoundException(`User with email ${email} does not exist`)

        return AppUser.parse({
            id: user.id,
            creationDate: user.creationDate,
            lastLoginDate: latestVersion.lastLoginDate,
            lastModified: latestVersion.effectiveFrom,
            email: latestVersion.email,
            isDeleted: latestVersion.isDeleted,
            isSystemAdmin: latestVersion.isSystemAdmin,
            name: latestVersion.name,
            // Roles are associated with organizations, not users
            role: undefined
        } as z.infer<typeof AppUser>)
    }

    /**
     * Get the app user by id.
     * Note: The 'role' will not be populated. Use the OrganizationInteractor methods if you need the associated role.
     * @param id - The id of the app user
     * @returns The app user
     * @throws {NotFoundException} If the user does not exist
     */
    async getUserById(id: z.infer<typeof AppUser>['id']): Promise<z.infer<typeof AppUser>> {
        const em = this._em

        const user = await em.findOne(AppUserModel, { id }),
            latestVersion = await user?.latestVersion

        if (!user || !latestVersion)
            throw new NotFoundException(`User with id ${id} does not exist`)

        return AppUser.parse({
            id: user.id,
            creationDate: user.creationDate,
            lastLoginDate: latestVersion.lastLoginDate,
            lastModified: latestVersion.effectiveFrom,
            email: latestVersion.email,
            isDeleted: latestVersion.isDeleted,
            isSystemAdmin: latestVersion.isSystemAdmin,
            name: latestVersion.name,
            // Roles are associated with organizations, not users
            role: undefined
        } as z.infer<typeof AppUser>)
    }

    /**
     * Returns all organization ids associated with the app user
     * @param appUserId - The id of the app user
     * @returns The organizations associated with the app user
     */
    async getUserOrganizationIds(appUserId: z.infer<typeof AppUser>['id']): Promise<z.infer<typeof Organization>['id'][]> {
        const em = this._em

        const auors = (await em.find(AppUserOrganizationRoleModel, { appUser: appUserId }))
            .filter(async auor => (await auor.latestVersion) != undefined)

        const organizationIds = auors.map(auor => auor.organization.id)

        const organizations = (await em.find(OrganizationModel, { id: { $in: organizationIds } }))
            .filter(async org => (await org.latestVersion) != undefined)

        return organizations.map(org => org.id)
    }

    /**
     * Checks if the specified app user exists
     */
    async hasUser(id: z.infer<typeof AppUser>['id']): Promise<boolean> {
        const em = this._em,
            user = await em.findOne(AppUserModel, { id })

        return user != undefined && (await user.latestVersion) != undefined
    }

    /**
     * Update the app user
     * @param props - The properties to update
     * @throws {NotFoundException} If the user does not exist
     */
    async updateAppUser(props: Pick<z.infer<typeof AppUser>, 'id' | 'name' | 'email' | 'lastLoginDate'> & UpdationInfo): Promise<void> {
        const em = this._em,
            user = await em.findOneOrFail(AppUserModel, { id: props.id }),
            latestVersion = (await user.latestVersion)

        if (latestVersion == undefined)
            throw new NotFoundException(`User with id ${props.id} does not exist`)

        em.create(AppUserVersionsModel, {
            appUser: user,
            effectiveFrom: props.modifiedDate,
            email: props.email,
            isDeleted: latestVersion.isDeleted,
            isSystemAdmin: latestVersion.isSystemAdmin,
            lastLoginDate: props.lastLoginDate,
            modifiedBy: props.modifiedById,
            name: props.name
        })

        await em.flush()
    }
}