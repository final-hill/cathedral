import { AppUser } from "~/domain/application";
import { Repository } from "./Repository";
import { AppUserModel, AppUserOrganizationRoleModel, OrganizationModel } from "../models";
import { Organization } from "~/domain/requirements";

export class AppUserRepository extends Repository<AppUser> {
    /**
     * Get the app user by id.
     * Note: The 'role' will not be populated. Use the OrganizationInteractor methods if you need the associated role.
     * @param id - The id of the app user
     * @returns The app user
     * @throws {Error} If the user does not exist
     */
    async getUserById(id: AppUser['id']): Promise<AppUser> {
        const em = this._fork()

        const user = await em.findOneOrFail(AppUserModel, {
            id,
            latestVersion: { isDeleted: false }
        })

        const latestVersion = user.latestVersion?.getEntity()

        if (latestVersion == undefined)
            throw new Error(`User with id ${id} does not exist`)

        return new AppUser({
            id: user.id,
            creationDate: user.creationDate,
            lastLoginDate: latestVersion.lastLoginDate,
            effectiveFrom: latestVersion.effectiveFrom,
            email: latestVersion.email,
            isDeleted: latestVersion.isDeleted,
            isSystemAdmin: latestVersion.isSystemAdmin,
            name: latestVersion.name,
            // Roles are associated with organizations, not users
            role: undefined
        })
    }

    /**
     * Returns all organization ids associated with the app user
     * @param appUserId - The id of the app user
     * @returns The organizations associated with the app user
     */
    async getUserOrganizationIds(appUserId: AppUser['id']): Promise<Organization['id'][]> {
        const em = this._fork()

        const auors = (await em.find(AppUserOrganizationRoleModel, {
            appUser: appUserId,
            latestVersion: { isDeleted: false }
        }, {
            populate: ['latestVersion']
        }))
            .filter(auor => auor.latestVersion != undefined)

        const organizationIds = auors.map(auor => auor.organization.id)

        const organizations = (await em.find(OrganizationModel, {
            id: { $in: organizationIds },
            latestVersion: { isDeleted: false }
        }))
            .filter(org => org.latestVersion != undefined)

        return organizations.map(org => org.id)
    }

    /**
     * Checks if the specified app user exists
     */
    async hasUser(id: AppUser['id']): Promise<boolean> {
        const em = this._fork(),
            user = await em.findOne(AppUserModel, {
                id,
                latestVersion: { isDeleted: false }
            })

        return user != undefined && user.latestVersion?.getEntity() != undefined
    }
}