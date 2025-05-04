import type { AppUserRepository } from "~/server/data/repositories/AppUserRepository";
import { Interactor } from "./Interactor";
import { AppUser, MismatchException, PermissionDeniedException } from "#shared/domain";
import type { z } from "zod";
import type { PermissionInteractor } from "./PermissionInteractor";
import type { AppCredentials } from "~/shared/domain/application/AppCredentials";
import type { CreationInfo } from "~/server/data/repositories";

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
    async createAppUser(props: Omit<z.infer<typeof AppUser>, 'id' | 'role'>): Promise<z.infer<typeof AppUser>['id']> {
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
    async getUserByEmail(email: z.infer<typeof AppUser>['email']): Promise<z.infer<typeof AppUser>> {
        const currentUserId = this._permissionInteractor.userId,
            currentUser = await this.getUserById(currentUserId)
        if (email !== currentUser.email && !currentUser.isSystemAdmin)
            throw new PermissionDeniedException(`User with id ${currentUserId} does not have permission to get user with email ${email}`);

        return this.repository.getUserByEmail(email)
    }

    /**
     * Check if the requested user exists
     * @param email - The email of the user
     * @returns Whether the user exists
     * @throws {PermissionDeniedException} If the current user is not a system admin or the user being queried is not the current user
     */
    async hasUser(email: z.infer<typeof AppUser>['email']): Promise<boolean> {
        console.log('Checking if user exists', email)
        console.log('Current user id', this._permissionInteractor.userId)

        const currentUserId = this._permissionInteractor.userId,
            currentUser = await this.getUserById(currentUserId)
        if (email !== currentUser.email && !currentUser.isSystemAdmin)
            throw new PermissionDeniedException(`User ${currentUser.email} does not have permission to check if user with email ${email} exists`);

        return this.repository.hasUser(email)
    }

    /**
     * Update an app user
     * @param props - The properties to update
     * @throws {PermissionDeniedException} If the current user is not a system admin or the user being updated is not the current user
     * @throws {NotFoundException} If the user does not exist
     */
    async updateUser(props: Pick<z.infer<typeof AppUser>, 'id' | 'name' | 'email' | 'lastLoginDate'>): Promise<void> {
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

    /**
     * Add a credential for an app user
     * @param props - The properties of the credential
     * @throws {PermissionDeniedException} If the current user is not a system admin or the user being updated is not the current user
     */
    async addCredential(props: Omit<z.infer<typeof AppCredentials>, keyof CreationInfo>): Promise<void> {
        const currentUserId = this._permissionInteractor.userId,
            currentUser = await this.getUserById(currentUserId);

        if (props.appUser.id !== currentUser.id && !currentUser.isSystemAdmin)
            throw new PermissionDeniedException(`User with id ${currentUserId} does not have permission to add credentials for user with id ${props.appUser.id}`);

        await this.repository.addCredential({
            ...props,
            createdById: currentUserId,
            creationDate: new Date()
        });
    }

    /**
     * Get the credentials for an app user by email
     * @param email - The email of the app user
     * @returns The credentials of the app user
     * @throws {PermissionDeniedException} If the current user is not a system admin or the user being queried is not the current user
     */
    async getAllCredentials(email: z.infer<typeof AppUser>['email']): Promise<z.infer<typeof AppCredentials>[]> {
        const currentUserId = this._permissionInteractor.userId,
            currentUser = await this.getUserById(currentUserId);

        if (email !== currentUser.email && !currentUser.isSystemAdmin)
            throw new PermissionDeniedException(`User with id ${currentUserId} does not have permission to get credentials for user with email ${email}`);

        const appUser = await this.repository.getUserByEmail(email),
            credentials = await this.repository.getCredentialsByUserId(appUser.id);

        return credentials;
    }

    /**
     * Check if a credential exists by its ID
     * @param credentialId - The ID of the credential
     * @returns Whether the credential exists
     * @throws {PermissionDeniedException} If the current user is not a system admin or the owner of the credential
     */
    async hasCredential(credentialId: z.infer<typeof AppCredentials>['id']): Promise<boolean> {
        const currentUserId = this._permissionInteractor.userId,
            currentUser = await this.getUserById(currentUserId);

        if (!currentUser.isSystemAdmin) {
            const credential = await this.repository.getCredentialById(credentialId);
            if (credential.appUser.id !== currentUser.id)
                throw new PermissionDeniedException(`User with id ${currentUserId} does not have permission to check credential with id ${credentialId}`);
        }

        return this.repository.hasCredential(credentialId);
    }

    /**
     * Get a credential by its ID
     * @param credentialId - The ID of the credential
     * @returns The credential
     * @throws {NotFoundException} If the credential does not exist
     * @throws {PermissionDeniedException} If the current user is not a system admin or the owner of the credential
     * @throws {MismatchException} If the credential counter is invalid
     */
    async getCredential(credentialId: z.infer<typeof AppCredentials>['id']): Promise<z.infer<typeof AppCredentials>> {
        const currentUserId = this._permissionInteractor.userId,
            currentUser = await this.getUserById(currentUserId);

        if (!currentUser.isSystemAdmin) {
            const credential = await this.repository.getCredentialById(credentialId);
            if (credential.appUser.id !== currentUser.id)
                throw new PermissionDeniedException(`User with id ${currentUserId} does not have permission to get credential with id ${credentialId}`);
        }

        const credential = await this.repository.getCredentialById(credentialId);

        if (credential.counter < 0)
            throw new MismatchException('Credential counter is invalid');

        await this.repository.incrementCredentialCounter(credentialId);

        return credential;
    }
}