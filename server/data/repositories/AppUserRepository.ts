import { AppUser, DuplicateEntityException, NotFoundException, ReqType } from "#shared/domain";
import { Repository } from "./Repository";
import { AppUserModel, AppUserVersionsModel } from "../models";
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
    async createAppUser(props: Omit<z.infer<typeof AppUser>, 'role'> & CreationInfo): Promise<z.infer<typeof AppUser>['id']> {
        const em = this._em,
            existingUserStatic = await em.findOne(AppUserModel, { id: props.id }),
            existingUserLatestVersion = await existingUserStatic?.getLatestVersion(props.creationDate)

        if (existingUserLatestVersion)
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

        const userStatic = await em.findOne(AppUserModel, { versions: { email } }),
            userLatestVersion = await userStatic?.getLatestVersion(new Date())

        if (!userStatic || !userLatestVersion)
            throw new NotFoundException(`User with email ${email} does not exist`)

        const orgStatics = await userLatestVersion.appUser.organizations.loadItems(),
            maybeOrgs = await Promise.all(orgStatics.map(async (org) => {
                const orgLatestVersion = await org.getLatestVersion(new Date())
                return orgLatestVersion ? {
                    reqType: ReqType.ORGANIZATION,
                    id: org.id,
                    name: orgLatestVersion.name
                } : undefined
            })),
            organizations = maybeOrgs.filter((org) => org != undefined)

        return AppUser.parse({
            id: userStatic.id,
            creationDate: userStatic.creationDate,
            lastLoginDate: userLatestVersion.lastLoginDate,
            lastModified: userLatestVersion.effectiveFrom,
            email: userLatestVersion.email,
            isDeleted: userLatestVersion.isDeleted,
            isSystemAdmin: userLatestVersion.isSystemAdmin,
            name: userLatestVersion.name,
            organizations
        } as z.infer<typeof AppUser>)
    }

    /**
     * Get the app user by id.
     * @param id - The id of the app user
     * @returns The app user
     * @throws {NotFoundException} If the user does not exist
     */
    async getUserById(id: z.infer<typeof AppUser>['id']): Promise<z.infer<typeof AppUser>> {
        const em = this._em,
            userStatic = await em.findOne(AppUserModel, { id }),
            userLatestVersion = await userStatic?.getLatestVersion(new Date()) as AppUserVersionsModel | undefined

        if (!userStatic || !userLatestVersion)
            throw new NotFoundException(`User with id ${id} does not exist`)

        const orgStatics = await userLatestVersion.appUser.organizations.loadItems(),
            maybeOrgs = await Promise.all(orgStatics.map(async (org) => {
                const orgLatestVersion = await org.getLatestVersion(new Date())
                return orgLatestVersion ? {
                    reqType: ReqType.ORGANIZATION,
                    id: org.id,
                    name: orgLatestVersion.name
                } : undefined
            })),
            organizations = maybeOrgs.filter((org) => org != undefined)

        return AppUser.parse({
            id: userStatic.id,
            creationDate: userStatic.creationDate,
            lastLoginDate: userLatestVersion.lastLoginDate,
            lastModified: userLatestVersion.effectiveFrom,
            email: userLatestVersion.email,
            isDeleted: userLatestVersion.isDeleted,
            isSystemAdmin: userLatestVersion.isSystemAdmin,
            name: userLatestVersion.name,
            organizations
        } as z.infer<typeof AppUser>)
    }

    /**
     * Checks if the specified app user exists
     */
    async hasUser(id: z.infer<typeof AppUser>['id']): Promise<boolean> {
        const em = this._em,
            userStatic = await em.findOne(AppUserModel, { id }),
            latestUserVersion = await userStatic?.getLatestVersion(new Date())

        return latestUserVersion != undefined
    }

    /**
     * Update the app user
     * @param props - The properties to update
     * @throws {NotFoundException} If the user does not exist
     */
    async updateAppUser(props: Pick<z.infer<typeof AppUser>, 'id' | 'name' | 'email' | 'lastLoginDate'> & UpdationInfo): Promise<void> {
        const em = this._em,
            userStatic = await em.findOne(AppUserModel, { id: props.id }),
            latestVersion = await userStatic?.getLatestVersion(props.modifiedDate)

        if (!latestVersion)
            throw new NotFoundException(`User with id ${props.id} does not exist`)

        em.create(AppUserVersionsModel, {
            appUser: latestVersion.appUser,
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