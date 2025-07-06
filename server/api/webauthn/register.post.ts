import type { WebAuthnUser } from '#auth-utils'
import { z } from 'zod'
import cache from '~/server/utils/cache'
import { AppUser, DuplicateEntityException, MismatchException } from '~/shared/domain'
import { getConnection } from '~/mikro-orm.config'
import { AppUserInteractor, PermissionInteractor } from '~/application'
import { AppUserRepository, PermissionRepository } from '~/server/data/repositories'
import type { PostgreSqlDriver, SqlEntityManager } from '@mikro-orm/postgresql'
import { SYSTEM_USER_ID } from '~/shared/constants.js'

export default defineWebAuthnRegisterEventHandler({
    /**
     * Store the challenge in a cache for 60 seconds.
     * This is used to prevent replay attacks.
     * An attempt ID is created and sent with each authentication request.
     * @param _event - The event object (unused)
     * @param challenge - The challenge to store
     * @param attemptId - The unique identifier for the authentication attempt
     */
    async storeChallenge(_event, challenge, attemptId) {
        cache.set(`auth:challenge:${attemptId}`, challenge, { ttl: 60 })
    },
    /**
     * Retrieve the challenge from the cache.
     * This is used to prevent replay attacks.
     * @param _event - The event object (unused)
     * @param attemptId - The unique identifier for the authentication attempt
     * @returns The stored challenge
     * @throws {MismatchException} If the challenge is not found or expired
     */
    async getChallenge(_event, attemptId) {
        const challenge = cache.get<string>(`auth:challenge:${attemptId}`)

        if (!challenge)
            handleDomainException(new MismatchException('Challenge not found or expired'))

        cache.del(`auth:challenge:${attemptId}`)

        return challenge!
    },
    validateUser: (user: WebAuthnUser) => z.object({
        userName: AppUser.pick({ email: true }).shape.email,
        displayName: AppUser.pick({ name: true }).shape.name
    }).parseAsync(user),
    /**
     * The credential creation has been successful.
     * Create the user in the database and set the session.
     */
    async onSuccess(event, { user, credential }) {
        const em = (await getConnection()).em.fork({ useContext: true }) as SqlEntityManager<PostgreSqlDriver>,
            appUserInteractor = new AppUserInteractor({
                permissionInteractor: new PermissionInteractor({
                    userId: SYSTEM_USER_ID,
                    repository: new PermissionRepository({ em })
                }),
                repository: new AppUserRepository({ em })
            })

        let appUser: z.infer<typeof AppUser> | undefined

        const userExists = await appUserInteractor.hasUser(user.userName)

        if (userExists)
            handleDomainException(new DuplicateEntityException('User already exists'))

        try {
            const effectiveDate = new Date(),
                newUserId = (await appUserInteractor.createAppUser({
                    creationDate: effectiveDate,
                    lastLoginDate: effectiveDate,
                    isSystemAdmin: false,
                    name: user.displayName,
                    email: user.userName,
                    lastModified: effectiveDate,
                    organizations: []
                }))!

            appUser = (await appUserInteractor.getUserById(newUserId))!

            await appUserInteractor.addCredential({
                id: credential.id,
                appUser: {
                    email: appUser.email,
                    id: appUser.id,
                    name: appUser.name
                },
                backedUp: credential.backedUp,
                counter: credential.counter,
                publicKey: credential.publicKey,
                transports: credential.transports ?? []
            })

            await setUserSession(event, {
                id: appUser.id,
                user: {
                    id: appUser.id,
                    email: appUser.email,
                    name: appUser.name
                }
            })
        } catch (error: unknown) {
            handleDomainException(error)
        }
    }
})
