import type { AppRole, Organization } from '#shared/domain'
import { AppUserOrganizationRole, NotFoundException, AppUser, ReqType, DuplicateEntityException } from '#shared/domain'
import { AppUserModel, AppUserOrganizationRoleModel } from '../models'
import type { CreationInfo } from './CreationInfo'
import type { DeletionInfo } from './DeletionInfo'
import type { UpdationInfo } from './UpdationInfo'
import { Repository } from './Repository'
import type { z } from 'zod'

export class PermissionRepository extends Repository<z.infer<typeof AppUserOrganizationRole>> {
    /**
     * Associates an app user with the organization with the specified role
     * @param auor.appUserId - The id of the app user
     * @param auor.organizationId - The id of the organization
     * @param auor.role - The role of the app user in the organization
     * @throws {DuplicateEntityException} If the app user organization role already exists
     */
    async addAppUserOrganizationRole(auor: { appUserId: string, organizationId: string, role: AppRole } & CreationInfo): Promise<void> {
        const em = this._em,
            auorModel = await em.findOneOrFail(AppUserOrganizationRoleModel, {
                appUser: auor.appUserId,
                organization: auor.organizationId
            }),
            existingRole = auorModel?.role

        if (existingRole === auor.role)
            throw new DuplicateEntityException('App user organization role already exists with the same role')

        em.create(AppUserOrganizationRoleModel, {
            appUser: auor.appUserId,
            organization: auor.organizationId,
            createdBy: auor.createdById,
            creationDate: auor.creationDate,
            role: auor.role,
            lastModified: auor.creationDate,
            modifiedBy: auor.appUserId
        })

        await em.flush()
    }

    /**
     * Deletes an app user organization role
     * @param auor.appUserId - The id of the app user
     * @param auor.organizationId - The id of the organization
     * @param auor.deletedById - The id of the user deleting the app user organization role
     * @param auor.effectiveDate - The effective date of the deletion
     * @throws {NotFoundException} If the app user organization role does not exist
     */
    async deleteAppUserOrganizationRole(auor: { appUserId: string, organizationId: z.infer<typeof Organization>['id'] } & DeletionInfo): Promise<void> {
        const em = this._em,
            auorModel = await em.findOne(AppUserOrganizationRoleModel, {
                appUser: auor.appUserId,
                organization: auor.organizationId
            })

        if (!auorModel)
            throw new NotFoundException('App user organization role does not exist')

        em.removeAndFlush(auorModel)
    }

    /**
     * Finds all AppUserOrganizationRoles for a given organization
     * @param filter - The filter to apply
     * @param filter.appUserId - The id of the app user
     * @param filter.organizationId - The id of the organization
     * @param filter.role - The role of the app user in the organization
     * @returns The list of AppUserOrganizationRoles
     */
    async findAppUserOrganizationRoles(filter: { appUserId?: string, organizationId?: string, role?: AppRole }): Promise<z.infer<typeof AppUserOrganizationRole>[]> {
        const em = this._em,
            auorModels = await em.find(AppUserOrganizationRoleModel, {
                organization: filter.organizationId,
                appUser: filter.appUserId
            }, { populate: ['appUser', 'createdBy', 'organization'] })

        return Promise.all(auorModels.map(async (auor) => {
            if (filter.role && auor.role !== filter.role)
                return null

            const orgLatestVersion = await auor.organization.load().then(org => org?.getLatestVersion(new Date()))

            return AppUserOrganizationRole.parse({
                appUser: { id: auor.appUser.id, name: auor.appUser!.name },
                organization: { id: auor.organization.id, name: orgLatestVersion!.name },
                role: auor.role,
                createdBy: { id: auor.createdBy.id, name: auor.createdBy!.name },
                modifiedBy: { id: auor.modifiedBy.id, name: auor.modifiedBy!.name },
                creationDate: auor.creationDate,
                lastModified: auor.lastModified
            })
        })).then(results => results.filter(Boolean) as z.infer<typeof AppUserOrganizationRole>[])
    }

    /**
     * Returns the AppUserOrganizationRole for the given app user and organization
     * @param appUserId - The id of the app user
     * @param organizationId - The id of the organization
     * @returns The AppUserOrganizationRole
     * @throws {NotFoundException} If the app user organization role does not exist
     */
    async getAppUserOrganizationRole(appUserId: z.infer<typeof AppUser>['id'], organizationId: z.infer<typeof Organization>['id']): Promise<z.infer<typeof AppUserOrganizationRole>> {
        const em = this._em,
            auorModel = await em.findOne(AppUserOrganizationRoleModel, {
                appUser: appUserId,
                organization: organizationId
            }, { populate: ['appUser', 'organization', 'createdBy'] })

        if (!auorModel)
            throw new NotFoundException('App user organization role does not exist')

        const orgLatestVersion = await auorModel.organization.load().then(org => org?.getLatestVersion(new Date()))

        return AppUserOrganizationRole.parse({
            appUser: { id: auorModel.appUser.id, name: auorModel.appUser!.name },
            organization: { id: auorModel.organization.id, name: orgLatestVersion!.name },
            role: auorModel.role,
            createdBy: { id: auorModel.createdBy.id, name: auorModel.createdBy!.name },
            modifiedBy: { id: auorModel.modifiedBy.id, name: auorModel.modifiedBy!.name },
            creationDate: auorModel.creationDate,
            lastModified: auorModel.lastModified
        })
    }

    /**
     * Get the app user by id.
     * @param id - The id of the app user
     * @returns The app user
     * @throws {NotFoundException} If the user does not exist
     */
    // TODO: this is duplicated with the AppUserRepository
    async getUserById(id: z.infer<typeof AppUser>['id']): Promise<z.infer<typeof AppUser>> {
        const em = this._em,
            userModel = await em.findOne(AppUserModel, { id })

        if (!userModel)
            throw new NotFoundException(`User with id ${id} does not exist`)

        const orgStatics = await userModel.organizations.loadItems(),
            maybeOrgs = await Promise.all(orgStatics.map(async (org) => {
                const orgLatestVersion = await org.getLatestVersion(new Date())
                return orgLatestVersion
                    ? {
                            reqType: ReqType.ORGANIZATION,
                            id: org.id,
                            name: orgLatestVersion.name
                        }
                    : undefined
            })),
            organizations = maybeOrgs.filter(org => org != undefined)

        return AppUser.parse({
            id: userModel.id,
            creationDate: userModel.creationDate,
            lastLoginDate: userModel.lastLoginDate,
            lastModified: userModel.lastModified,
            email: userModel.email,
            isSystemAdmin: userModel.isSystemAdmin,
            name: userModel.name,
            organizations
        } as z.infer<typeof AppUser>)
    }

    /**
     * Updates the role of an app user in the organization
     * @param props.appUserId - The id of the app user
     * @param props.organizationId - The id of the organization
     * @param props.role - The new role of the app user
     * @param props.modifiedById - The id of the user modifying the app user organization role
     * @param props.modifiedDate - The effective date of the modification
     * @throws {NotFoundException} If the app user organization role does not exist
     */
    async updateAppUserRole(props: { appUserId: z.infer<typeof AppUser>['id'], organizationId: z.infer<typeof Organization>['id'], role: AppRole } & UpdationInfo): Promise<void> {
        const em = this._em,
            auorModel = await em.findOne(AppUserOrganizationRoleModel, {
                appUser: props.appUserId,
                organization: props.organizationId
            })

        if (!auorModel)
            throw new NotFoundException('App user organization role does not exist')

        em.assign(auorModel, {
            role: props.role,
            lastModified: props.modifiedDate,
            modifiedBy: props.modifiedById
        })

        await em.flush()
    }
}
