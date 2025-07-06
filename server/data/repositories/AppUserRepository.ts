import { AppUser, DuplicateEntityException, NotFoundException, ReqType, AppCredentials } from '#shared/domain'
import { Repository } from './Repository'
import { AppUserModel, AppCredentialsModel } from '../models'
import { v7 as uuid7 } from 'uuid'
import type { CreationInfo } from './CreationInfo'
import type { UpdationInfo } from './UpdationInfo'
import type { z } from 'zod'
import { DataModelToDomainModel } from '../mappers'

export class AppUserRepository extends Repository<z.infer<typeof AppUser>> {
    /**
     * Create a new app user
     * @param props - The properties of the app user
     * @returns The id of the created app user
     * @throws {DuplicateEntityException} If the user already exists
     */
    async createAppUser(props: Omit<z.infer<typeof AppUser>, 'role' | 'id'> & CreationInfo): Promise<z.infer<typeof AppUser>['id']> {
        const em = this._em,
            existingUser = await em.findOne(AppUserModel, { email: props.email })

        if (existingUser)
            throw new DuplicateEntityException(`User with email ${props.email} already exists`)

        const newUser = em.create(AppUserModel, {
            id: uuid7(),
            createdBy: props.createdById,
            creationDate: props.lastModified,
            modifiedBy: props.createdById,
            lastModified: props.lastModified,
            email: props.email,
            isSystemAdmin: props.isSystemAdmin,
            lastLoginDate: props.lastLoginDate,
            name: props.name
        })

        await em.flush()

        return newUser.id
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

        const appUser = await em.findOne(AppUserModel, { email })

        if (!appUser)
            throw new NotFoundException(`User with email ${email} does not exist`)

        const orgStatics = await appUser.organizations.loadItems(),
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

        const mapper = new DataModelToDomainModel()

        return AppUser.parse(await mapper.map({
            ...appUser,
            // @ts-expect-error - organizations exists in the subclass but not in base type
            organizations
        }))
    }

    /**
     * Get the app user by id.
     * @param id - The id of the app user
     * @returns The app user
     * @throws {NotFoundException} If the user does not exist
     */
    async getUserById(id: z.infer<typeof AppUser>['id']): Promise<z.infer<typeof AppUser>> {
        const em = this._em,
            appUser = await em.findOne(AppUserModel, { id })

        if (!appUser)
            throw new NotFoundException(`User with id ${id} does not exist`)

        const orgStatics = await appUser.organizations.loadItems(),
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

        const mapper = new DataModelToDomainModel()

        return AppUser.parse(await mapper.map({
            ...appUser,
            // @ts-expect-error - organizations exists in the subclass but not in base type
            organizations
        }))
    }

    /**
     * Checks if the specified app user exists
     */
    async hasUser(email: z.infer<typeof AppUser>['email']): Promise<boolean> {
        const em = this._em,
            appUser = await em.findOne(AppUserModel, { email })

        return appUser != undefined
    }

    /**
     * Update the app user
     * @param props - The properties to update
     * @throws {NotFoundException} If the user does not exist
     */
    async updateAppUser(props: Pick<z.infer<typeof AppUser>, 'id' | 'name' | 'email' | 'lastLoginDate'> & UpdationInfo): Promise<void> {
        const em = this._em,
            appUser = await em.findOne(AppUserModel, { id: props.id })

        if (!appUser)
            throw new NotFoundException(`User with id ${props.id} does not exist`)

        em.assign(appUser, {
            lastModified: props.modifiedDate,
            email: props.email,
            lastLoginDate: props.lastLoginDate,
            modifiedBy: props.modifiedById,
            name: props.name
        })

        await em.flush()
    }

    /**
     * Add a credential for the app user
     * @param props - The properties of the credential
     */
    async addCredential(props: z.infer<typeof AppCredentials> & CreationInfo): Promise<z.infer<typeof AppCredentials>['id']> {
        const em = this._em,
            credential = em.create(AppCredentialsModel, {
                id: props.id,
                appUser: props.appUser.id,
                publicKey: props.publicKey,
                counter: props.counter,
                backedUp: props.backedUp,
                transports: props.transports
            })

        await em.persistAndFlush(credential)

        return credential.id
    }

    /**
     * Get credentials for a user by their ID
     * @param userId - The ID of the app user
     * @returns The credentials of the app user as domain objects
     */
    async getCredentialsByUserId(userId: z.infer<typeof AppUser>['id']): Promise<z.infer<typeof AppCredentials>[]> {
        const em = this._em,
            credentials = await em.find(AppCredentialsModel, { appUser: userId })

        return credentials.map(credential => AppCredentials.parse({
            id: credential.id,
            appUser: {
                id: credential.appUser.id,
                name: credential.appUser.name,
                email: credential.appUser.email
            },
            publicKey: credential.publicKey,
            counter: credential.counter,
            backedUp: credential.backedUp,
            transports: credential.transports
        } as z.infer<typeof AppCredentials>))
    }

    /**
     * Check if a credential exists by its ID
     * @param credentialId - The ID of the credential
     * @returns Whether the credential exists
     */
    async hasCredential(credentialId: z.infer<typeof AppCredentials>['id']): Promise<boolean> {
        const em = this._em
        const credential = await em.findOne(AppCredentialsModel, { id: credentialId })
        return credential != undefined
    }

    /**
     * Get a credential by its ID
     * @param credentialId - The ID of the credential
     * @returns The credential
     * @throws {NotFoundException} If the credential does not exist
     */
    async getCredentialById(credentialId: z.infer<typeof AppCredentials>['id']): Promise<z.infer<typeof AppCredentials>> {
        const em = this._em,
            credential = await em.findOne(AppCredentialsModel, {
                id: credentialId
            }, { populate: ['appUser'] })

        if (!credential)
            throw new NotFoundException(`Credential with id ${credentialId} does not exist`)

        return AppCredentials.parse({
            id: credential.id,
            appUser: {
                id: credential.appUser.id,
                name: credential.appUser.name,
                email: credential.appUser.email
            },
            publicKey: credential.publicKey,
            counter: credential.counter,
            backedUp: credential.backedUp,
            transports: credential.transports
        } as z.infer<typeof AppCredentials>)
    }

    /**
     * Increment the counter for a credential by its ID
     * @param credentialId - The ID of the credential
     * @throws {NotFoundException} If the credential does not exist
     */
    async incrementCredentialCounter(credentialId: z.infer<typeof AppCredentials>['id']): Promise<void> {
        const em = this._em,
            credential = await em.findOne(AppCredentialsModel, { id: credentialId })

        if (!credential)
            throw new NotFoundException(`Credential with id ${credentialId} does not exist`)

        em.assign(credential, {
            counter: credential.counter + 1
        })

        await em.flush()
    }
}
