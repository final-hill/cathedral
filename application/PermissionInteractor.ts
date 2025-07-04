import { AppRole, AppUserOrganizationRole, NotFoundException, Organization, PermissionDeniedException, type AppUser } from "#shared/domain";
import type { PermissionRepository } from "~/server/data/repositories/PermissionRepository";
import type { z } from "zod";
import { SYSTEM_SLACK_USER_ID } from "~/shared/constants.js";

/**
 * Interactor for checking permissions
 * for the current user in the context of an organization.
 */
export class PermissionInteractor {
    private readonly _userId: z.infer<typeof AppUser>['id'];
    private readonly _repository: PermissionRepository;

    constructor(props: { userId: z.infer<typeof AppUser>['id'], repository: PermissionRepository }) {
        this._userId = props.userId;
        this._repository = props.repository;
    }

    get userId(): z.infer<typeof AppUser>['id'] {
        return this._userId;
    }

    /**
     * Check if the user is the Slack bot
     * @throws {PermissionDeniedException} If the user is not the Slack bot and not a system admin
     */
    async assertSlackBot(): Promise<void> {
        if (!this.isSlackBot() && !await this.isSystemAdmin())
            throw new PermissionDeniedException('Forbidden: You do not have permissions to perform this action.');
    }

    /**
     * Check if the user is an organization admin
     * @param organizationId Optional organization ID for organization-specific checks
     * @throws {PermissionDeniedException} If the user is not an organization admin
     */
    async assertOrganizationAdmin(organizationId: z.infer<typeof Organization>['id']): Promise<void> {
        if (!await this.isOrganizationAdmin(organizationId))
            throw new PermissionDeniedException('Forbidden: You do not have admin permissions.');
    }

    /**
     * Check if the user is an organization contributor
     * @param organizationId Optional organization ID for organization-specific checks
     * @throws {PermissionDeniedException} If the user is not an organization contributor
     */
    async assertOrganizationContributor(organizationId: z.infer<typeof Organization>['id']): Promise<void> {
        if (!await this.isOrganizationContributor(organizationId))
            throw new PermissionDeniedException('Forbidden: You do not have contributor permissions.');
    }

    /**
     * Check if the user is an organization reader
     * @param organizationId Optional organization ID for organization-specific checks
     * @throws {PermissionDeniedException} If the user is not an organization reader
     */
    async assertOrganizationReader(organizationId: z.infer<typeof Organization>['id']): Promise<void> {
        if (!await this.isOrganizationReader(organizationId))
            throw new PermissionDeniedException('Forbidden: You do not have reader permissions.');
    }

    /**
     * Add an appuser to the organization with a role
     *
     * @param props.appUserId The id of the app user to invite
     * @param props.organizationId The id of the organization to add the app user to
     * @param props.role The role to assign to the app user
     * @throws {PermissionDeniedException} If the user is not an admin of the organization
     * @throws {DuplicateEntityException} If the target app user is already associated with the organization
     */
    async addAppUserOrganizationRole(props: { appUserId: string, organizationId: string, role: AppRole }): Promise<void> {
        await this.assertOrganizationAdmin(props.organizationId);
        await this._repository.addAppUserOrganizationRole({
            createdById: this._userId,
            creationDate: new Date(),
            ...props
        });
    }

    /**
     * Delete an app user from the organization
     * @param props.appUserId The id of the app user to remove
     * @param props.organizationId The id of the organization to remove the app user from
     */
    async deleteAppUserOrganizationRole(props: { appUserId: string, organizationId: string }): Promise<void> {
        await this.assertOrganizationAdmin(props.organizationId);
        await this._repository.deleteAppUserOrganizationRole({
            appUserId: props.appUserId,
            organizationId: props.organizationId,
            deletedById: this._userId,
            deletedDate: new Date()
        })
    }

    /**
     * Find all AppUserOrganizationRoles for the given organization
     * @param props.organizationId - The id of the organization
     * @param props.appUserId - The id of the app user
     * @param props.role - The role of the app user in the organization
     * @throws {PermissionDeniedException} If the user is not a reader of the organization or better
     * @returns The list of AppUserOrganizationRoles
     */
    async findAppUserOrganizationRoles(props: { appUserId?: z.infer<typeof AppUser>['id'], organizationId: z.infer<typeof Organization>['id'], role?: AppRole }): Promise<z.infer<typeof AppUserOrganizationRole>[]> {
        await this.assertOrganizationReader(props.organizationId);
        return this._repository.findAppUserOrganizationRoles({
            appUserId: props.appUserId,
            organizationId: props.organizationId,
            role: props.role
        });
    }

    /**
     * Returns the AppUserOrganizationRole for the given app user and organization
     * @param props.appUserId - The id of the app user
     * @param props.organizationId - The id of the organization
     * @returns The AppUserOrganizationRole
     * @throws {PermissionDeniedException} If the user is not a reader of the organization or better
     * @throws {NotFoundException} If the app user organization role does not exist
     */
    async getAppUserOrganizationRole(props: { appUserId: z.infer<typeof AppUser>['id'], organizationId: z.infer<typeof Organization>['id'] }): Promise<z.infer<typeof AppUserOrganizationRole>> {
        await this.assertOrganizationReader(props.organizationId);
        const auor = await this._repository.getAppUserOrganizationRole(props.appUserId, props.organizationId);

        if (!auor)
            throw new NotFoundException('App user organization role does not exist');

        return auor;
    }

    /**
     * Get the current user's name
     * @throws If the user does not exist
     * @returns The current user's name
     */
    async getCurrentUserName(): Promise<string> {
        const appUser = await this._repository.getUserById(this._userId);
        return appUser.name;
    }

    /**
     * Check if the user is a system admin
     * @returns True if the user is a system admin
     */
    async isSystemAdmin(): Promise<boolean> {
        const appUser = await this._repository.getUserById(this._userId);

        return appUser.isSystemAdmin;
    }

    async isSlackBot(): Promise<boolean> {
        return this._userId === SYSTEM_SLACK_USER_ID
    }

    /**
     * Check if the user is an organization admin
     * @param organizationId Optional organization ID for organization-specific checks
     * @returns True if the user is an organization admin
     */
    async isOrganizationAdmin(organizationId: z.infer<typeof Organization>['id']): Promise<boolean> {
        if (await this.isSystemAdmin()) return true;

        const auor = await this._repository.getAppUserOrganizationRole(this._userId, organizationId)
            .catch(error => error instanceof NotFoundException ? null : Promise.reject(error));

        return auor?.role === AppRole.ORGANIZATION_ADMIN;
    }

    /**
     * Check if the user is an organization contributor
     * @param organizationId Optional organization ID for organization-specific checks
     * @returns True if the user is an organization contributor
     */
    async isOrganizationContributor(organizationId: z.infer<typeof Organization>['id']): Promise<boolean> {
        if (await this.isSystemAdmin()) return true;

        const role = await this._repository.getAppUserOrganizationRole(this._userId, organizationId)
            .catch(error => error instanceof NotFoundException ? null : Promise.reject(error));

        return role?.role ? [AppRole.ORGANIZATION_ADMIN, AppRole.ORGANIZATION_CONTRIBUTOR].includes(role.role) : false;
    }

    /**
     * Check if the user is an organization reader
     * @param organizationId Optional organization ID for organization-specific checks
     * @returns True if the user is an organization reader
     */
    async isOrganizationReader(organizationId: z.infer<typeof Organization>['id']): Promise<boolean> {
        if (await this.isSystemAdmin()) return true;

        const role = await this._repository.getAppUserOrganizationRole(this._userId, organizationId)
            .catch(error => error instanceof NotFoundException ? null : Promise.reject(error));

        return role?.role ? [AppRole.ORGANIZATION_ADMIN, AppRole.ORGANIZATION_CONTRIBUTOR, AppRole.ORGANIZATION_READER].includes(role.role) : false;
    }

    /**
     * Update a target user by id in a given organization to have a new role
     *
     * @param props.appUserId The id of the target user to update
     * @param props.organizationId The id of the organization to update the target user in
     * @param props.role The new role to assign to the target user
     * @throws {PermissionDeniedException} If the current user is not an admin of the organization
     * @throws {NotFoundException} If the target user does not exist
     * @throws {PermissionDeniedException} If the target user is not in the same organization
     * @throws {PermissionDeniedException} If the target user is the last admin of the organization and the new role is not an admin
     * @throws {PermissionDeniedException} If the target user is trying to update themselves
     */
    async updateAppUserRole(props: { appUserId: z.infer<typeof AppUser>['id'], organizationId: z.infer<typeof Organization>['id'], role: AppRole }): Promise<void> {
        await this.assertOrganizationAdmin(props.organizationId);

        const currentUserId = this._userId,
            targetUserAuor = await this.getAppUserOrganizationRole({
                appUserId: props.appUserId,
                organizationId: props.organizationId
            });

        if (props.appUserId === currentUserId)
            throw new PermissionDeniedException('Forbidden: You cannot update your own role.');

        if (targetUserAuor.role === AppRole.ORGANIZATION_ADMIN && props.role !== AppRole.ORGANIZATION_ADMIN)
            throw new PermissionDeniedException('Forbidden: You cannot remove the last organization admin.');

        await this._repository.updateAppUserRole({
            appUserId: props.appUserId,
            organizationId: props.organizationId,
            role: props.role,
            modifiedById: this._userId,
            modifiedDate: new Date()
        })
    }
}
