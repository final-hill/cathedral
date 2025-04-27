import type { AppUserRepository } from "~/server/data/repositories/AppUserRepository";
import { Interactor } from "./Interactor";
import { AppUser, PermissionDeniedException } from "#shared/domain";
import type { z } from "zod";
import type { PermissionInteractor } from "./PermissionInteractor";

/**
 * Interactor for the AppUser
 */
export class AppUserInteractor extends Interactor<z.infer<typeof AppUser>> {
    private readonly _permissionInteractor: PermissionInteractor;

    /**
     * Create a new AppUserInteractor
     *
     * @param props.repository - The repository to use
     * @param props.permissionInteractor - The PermissionInteractor instance
     */
    constructor(props: {
        // TODO: This should be Repository<AppUser>
        repository: AppUserRepository,
        permissionInteractor: PermissionInteractor
    }) {
        super(props);
        this._permissionInteractor = props.permissionInteractor;
    }

    // TODO: This should not be necessary
    // This should be inferred as Repository<AppUser>
    get repository(): AppUserRepository {
        return this._repository as AppUserRepository
    }

    /**
     * Create a new app user
     * @param props - The properties of the app user
     * @returns The id of the created app user
     * @throws {PermissionDeniedException} If the current user is not a system admin
     */
    async createAppUser(props: Omit<z.infer<typeof AppUser>, 'role'>): Promise<z.infer<typeof AppUser>['id']> {
        const currentUserId = this._permissionInteractor.userId;

        if (!this._permissionInteractor.isSystemAdmin())
            throw new PermissionDeniedException(`User with id ${currentUserId} does not have permission to create users`);

        return this.repository.createAppUser({
            ...props,
            createdById: currentUserId,
            creationDate: new Date()
        });
    }

    /**
     * Get the app user by id
     * @param id - The id of the app user
     * @returns The app user
     * @throws {NotFoundException} If the user does not exist
     * @throws {PermissionDeniedException} If the current user is not a system admin or the user being queried is not the current user
     */
    async getUserById(id: z.infer<typeof AppUser>['id']): Promise<z.infer<typeof AppUser>> {
        const currentUserId = this._permissionInteractor.userId;
        if (id !== currentUserId && !this._permissionInteractor.isSystemAdmin())
            throw new PermissionDeniedException(`User with id ${currentUserId} does not have permission to get user with id ${id}`);

        return this.repository.getUserById(id);
    }

    /**
     * Get the app user by email
     * @param email - The email of the app user
     * @returns The app user
     * @throws {NotFoundException} If the user does not exist
     * @throws {PermissionDeniedException} If the current user is not a system admin or the user being queried is not the current user
     */
    async getAppUserByEmail(email: z.infer<typeof AppUser>['email']): Promise<z.infer<typeof AppUser>> {
        const currentUserId = this._permissionInteractor.userId,
            currentUser = await this.getUserById(currentUserId)
        if (email !== currentUser.email && !currentUser.isSystemAdmin)
            throw new PermissionDeniedException(`User with id ${currentUserId} does not have permission to get user with email ${email}`);

        return this.repository.getUserByEmail(email)
    }

    /**
     * Check if the requested user exists
     * @param id - The id of the user
     * @returns Whether the user exists
     * @throws {PermissionDeniedException} If the current user is not a system admin or the user being queried is not the current user
     */
    async hasUser(id: z.infer<typeof AppUser>['id']): Promise<boolean> {
        const currentUserId = this._permissionInteractor.userId,
            currentUser = await this.getUserById(currentUserId)
        if (id !== currentUser.id && !currentUser.isSystemAdmin)
            throw new PermissionDeniedException(`User with id ${currentUserId} does not have permission to check if user with id ${id} exists`);

        return this.repository.hasUser(id)
    }

    /**
     * Update an app user
     * @param props - The properties to update
     * @throws {PermissionDeniedException} If the current user is not a system admin or the user being updated is not the current user
     * @throws {NotFoundException} If the user does not exist
     */
    async updateAppUser(props: Pick<z.infer<typeof AppUser>, 'id' | 'name' | 'email' | 'lastLoginDate'>): Promise<void> {
        const currentUserId = this._permissionInteractor.userId,
            currentUser = await this.getUserById(currentUserId)
        if (props.id !== currentUser.id && !currentUser.isSystemAdmin)
            throw new PermissionDeniedException(`User with id ${currentUserId} does not have permission to update user with id ${props.id}`);

        return this.repository.updateAppUser({
            ...props,
            modifiedById: currentUserId,
            modifiedDate: new Date()
        })
    }
}