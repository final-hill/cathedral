import { NuxtAuthHandler } from '#auth'
import AzureADB2CProvider, { type AzureB2CProfile } from "next-auth/providers/azure-ad-b2c";
import { fork } from '~/server/data/orm'
import AppUserSystemAdminRole from '~/server/domain/application/AppUserSystemAdminRole';

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
            },
            async profile(profile: AzureB2CProfile) {
                const em = fork()

                const isSystemAdmin = await em.count(AppUserSystemAdminRole, {
                    appUserId: profile.oid
                }) > 0

                return {
                    id: profile.oid,
                    name: profile.name,
                    email: profile.emails[0],
                    isSystemAdmin
                    // image: profile.???
                }
            }
        })
    ],
    callbacks: {
        jwt({ token, account, profile }) {
            if (account)
                token.sessionToken = account.session_token
            if (profile)
                token.profile = profile
            return token
        },
        async session({ session, token }) {
            // Fetch data OR add previous data from the JWT callback.
            // const additionalUserData = await $fetch(`/api/session/${token}`)

            const profile = token.profile as any

            // Return the modified session
            return {
                ...session,
                user: {
                    id: profile.id,
                    name: profile.name,
                    email: profile.email,
                    isSystemAdmin: profile.isSystemAdmin,
                    picture: profile.picture
                }
            }
        }
    }
})