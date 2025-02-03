import { NuxtAuthHandler } from '#auth'
import AzureADB2CProvider, { type AzureB2CProfile } from "next-auth/providers/azure-ad-b2c";
import ormConfig from "~/mikro-orm.config"
import { AppUserInteractor } from '~/application/AppUserInteractor';
import { AppUserRepository } from '~/server/data/repositories/AppUserRepository';
import { NIL as SYSTEM_USER_ID } from 'uuid'

const config = useRuntimeConfig()

export default NuxtAuthHandler({
    secret: config.sessionPassword,
    providers: [
        // https://authjs.dev/reference/core/providers/azure-ad-b2c
        // https://next-auth.js.org/providers/azure-ad-b2c
        // @ts-expect-error You need to use .default here for it to work during SSR. May be fixed via Vite at some point
        AzureADB2CProvider.default({
            tenantId: config.authTenantName,
            clientId: config.authClientId,
            clientSecret: config.authClientSecret,
            primaryUserFlow: config.authPrimaryUserFlow,
            authorization: {
                params: { scope: 'openid' }
            }
        })
    ],
    callbacks: {
        async jwt({ token, account, profile, user }) {
            // The arguments user, account, profile and isNewUser
            // are only passed the first time this callback is called on a new session,
            // after the user signs in. In subsequent calls, only token will be available.

            if (account) {
                const p = profile as AzureB2CProfile,
                    effectiveDate = new Date(),
                    appUserInteractor = new AppUserInteractor({
                        userId: SYSTEM_USER_ID,
                        repository: new AppUserRepository({
                            config: ormConfig
                        })
                    })

                let appUser = await appUserInteractor.getAppUserById(p.oid)

                if (!appUser) {
                    const newUserId = await appUserInteractor.createAppUser({
                        id: p.oid,
                        creationDate: effectiveDate,
                        lastLoginDate: effectiveDate,
                        isSystemAdmin: false,
                        name: p.name,
                        email: p.emails[0],
                        lastModified: effectiveDate,
                        isDeleted: false,
                        role: undefined
                    })

                    appUser = await appUserInteractor.getAppUserById(newUserId)
                } else {
                    await appUserInteractor.updateAppUser({
                        name: p.name,
                        email: p.emails[0],
                        lastLoginDate: effectiveDate,
                        id: p.oid
                    })
                }

                Object.assign(token, {
                    id: p.oid,
                    name: p.name,
                    email: p.emails[0],
                    isSystemAdmin: appUser?.isSystemAdmin ?? false,
                    image: undefined,
                    accessToken: account.access_token,
                    sessionToken: account.session_token,
                })
            }

            return token
        },
        async session({ session, token }) {
            Object.assign(session, { ...token })

            return session
        }
    },
    session: {
        strategy: 'jwt'
    }
})