import { NuxtAuthHandler } from '#auth'
import GithubProvider from 'next-auth/providers/github'

export default NuxtAuthHandler({
    secret: useRuntimeConfig().authSecret,
    pages: {
        signIn: '/login'
    },
    providers: [
        // @ ts-expect-error You need to use .default here for it to work during SSR. May be fixed via Vite at some point
        GithubProvider({
            clientId: useRuntimeConfig().githubClientId,
            clientSecret: useRuntimeConfig().githubClientSecret,
            profile(profile) {
                return {
                    ...profile,
                    // TODO: load user roles from database
                    roles: void 0
                }
            }
        })
    ],
    session: {
        strategy: 'jwt'
    },
    callbacks: {
        async jwt({ token, user, account, profile, trigger }) {
            if (user)
                // @ts-expect-error: We're adding roles to the token
                token.roles = user.roles

            return token
        },
        async session({ session, token }) {
            // @ts-expect-error: We're adding roles to the session
            session.user.roles = token.roles

            return session
        }
    }
})