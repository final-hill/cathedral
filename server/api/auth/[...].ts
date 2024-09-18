import { NuxtAuthHandler } from '#auth'
import AzureADB2CProvider, { type AzureB2CProfile } from "next-auth/providers/azure-ad-b2c";
import { fork } from '~/server/data/orm'
import { AppUser } from '~/server/domain/application/index';

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
                    em = fork()

                let appUser = await em.findOne(AppUser, {
                    id: p.oid
                })

                if (!appUser) {
                    appUser = em.create(AppUser, {
                        id: p.oid,
                        creationDate: new Date(),
                        lastLoginDate: new Date(),
                        isSystemAdmin: false,
                        name: p.name,
                        email: p.emails[0]
                    })
                } else {
                    appUser.name = p.name
                    appUser.email = p.emails[0]
                    appUser.lastLoginDate = new Date()
                }

                await em.flush()

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