import { NuxtAuthHandler } from '#auth'
import GithubProvider, { type GithubProfile } from 'next-auth/providers/github'
import { fork } from '~/server/data/orm'
import AppUser from '~/server/domain/application/AppUser'

export default NuxtAuthHandler({
    secret: useRuntimeConfig().authSecret,
    pages: {
        signIn: '/login'
    },
    providers: [
        // @ts-expect-error You need to use .default here for it to work during SSR. May be fixed via Vite at some point
        GithubProvider.default({
            clientId: useRuntimeConfig().githubClientId,
            clientSecret: useRuntimeConfig().githubClientSecret,
            async profile(profile: GithubProfile) {
                if (!profile.email)
                    throw new Error('No email found in GitHub profile')

                const em = fork()

                let appUser = await em.findOne(AppUser, profile.email)

                if (!appUser) {
                    appUser = em.create(AppUser, {
                        id: profile.email,
                        name: profile.name ?? '{Anonymous}',
                        creationDate: new Date(),
                        isSystemAdmin: false
                    })

                    await em.flush()
                } else {
                    appUser.name = profile.name ?? '{Anonymous}'
                    await em.flush()
                }

                return {
                    id: appUser.id,
                    isSystemAdmin: appUser.isSystemAdmin,
                    name: appUser.name,
                    email: profile.email,
                    image: profile.avatar_url
                }
            }
        })
    ],
    session: {
        strategy: 'jwt'
    },
    callbacks: {
        async jwt({ token, user, account, profile, trigger }) {
            token = { ...token, ...user }

            return token
        },
        async session({ session, token }) {
            session = { ...session, ...token }

            return session
        }
    }
})