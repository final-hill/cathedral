import { PostgreSqlDriver, SqlEntityManager } from "@mikro-orm/postgresql";
import { NIL as SYSTEM_USER_ID } from 'uuid'
import { AppUserInteractor, PermissionInteractor } from "~/application";
import { getConnection } from "~/mikro-orm.config"
import { AppUserRepository, PermissionRepository } from "~/server/data/repositories";
import cache from '~/server/utils/cache';
import { MismatchException } from '~/shared/domain';

export default defineWebAuthnAuthenticateEventHandler({
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
    async getCredential(_event, credentialID) {
        const em = (await getConnection()).em.fork({ useContext: true }) as SqlEntityManager<PostgreSqlDriver>,
            appUserInteractor = new AppUserInteractor({
                permissionInteractor: new PermissionInteractor({
                    userId: SYSTEM_USER_ID,
                    repository: new PermissionRepository({ em })
                }),
                repository: new AppUserRepository({ em })
            });

        return appUserInteractor.getCredential(credentialID).catch(handleDomainException);
    },
    async onSuccess(event, { credential }) {
        await setUserSession(event, {
            id: credential.appUser.id,
            user: {
                id: credential.appUser.id,
                name: credential.appUser.name,
                email: credential.appUser.email
            }
        })
    }
})