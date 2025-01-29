import type { AppUserRepository } from "~/server/data/repositories/AppUserRepository";
import { Interactor } from "./Interactor";
import type { AppUser } from "~/domain/application";

/**
 * Interactor for the AppUser
 */
export class AppUserInteractor extends Interactor<AppUser> {
    /**
     * Create a new AppUserInteractor
     * @param props.userId - The id of the accessing user whose permissions are being checked
     * @param props.repository - The repository for the AppUser
     */
    constructor(props: {
        // TODO: This should be Repository<AppUser>
        repository: AppUserRepository,
        userId: AppUser['id']
    }) {
        super({ repository: props.repository, userId: props.userId })
    }

    protected async _isSystemAdmin(): Promise<boolean> {
        const currentUser = await this.getAppUserById(this._userId)
        return currentUser.isSystemAdmin
    }

    // TODO: This should not be necessary
    get repository(): AppUserRepository {
        return this._repository as AppUserRepository
    }

    /**
     * Get the app user by id
     * @param id - The id of the app user
     * @returns The app user
     * @throws {Error} If the user does not exist
     * @throws {Error} If the current user is not a system admin or the user being queried is not the current user
     */
    async getAppUserById(id: AppUser['id']): Promise<AppUser> {
        if (id !== this._userId && !this._isSystemAdmin())
            throw new Error(`User with id ${this._userId} does not have permission to get user with id ${id}`)
        return this.repository.getUserById(id)
    }

    /**
     * Get the app user by email
     * @param email - The email of the app user
     * @returns The app user
     * @throws {Error} If the user does not exist
     * @throws {Error} If the current user is not a system admin or the user being queried is not the current user
     */
    async getAppUserByEmail(email: AppUser['email']): Promise<AppUser> {
        const currentUser = await this.getAppUserById(this._userId)
        if (currentUser.email !== email && !this._isSystemAdmin())
            throw new Error(`User with id ${this._userId} does not have permission to get user with email ${email}`)
        return this.repository.getUserByEmail(email)
    }

    /**
     * Get the organization ids associated with the app user
     * @param id - The id of the app user
     * @returns The organization ids associated with the app user
     * @throws {Error} If the user does not exist
     * @throws {Error} If the current user is not a system admin or the user being queried is not the current user
     */
    async getUserOrganizationIds(id: AppUser['id']): Promise<AppUser['id'][]> {
        if (!(await this.repository.hasUser(id)))
            throw new Error(`User with id ${id} does not exist`)
        if (id !== this._userId && !this._isSystemAdmin())
            throw new Error(`User with id ${this._userId} does not have permission to get organization ids for user with id ${id}`)

        return this.repository.getUserOrganizationIds(id)
    }

    /**
     * Check if the requested user exists
     * @param id - The id of the user
     * @returns Whether the user exists
     * @throws {Error} If the current user is not a system admin or the user being queried is not the current user
     */
    async hasUser(id: AppUser['id']): Promise<boolean> {
        if (id !== this._userId && !this._isSystemAdmin())
            throw new Error(`User with id ${this._userId} does not have permission to check if user with id ${id} exists`)
        return this.repository.hasUser(id)
    }
}