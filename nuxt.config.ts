// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    compatibilityDate: '2024-07-22',
    devtools: {
        enabled: process.env.NODE_ENV === 'development'
    },
    sourcemap: process.env.NODE_ENV === 'development',
    css: [
        '~/assets/css/main.css',
        'primeflex/primeflex.css',
        'primeicons/primeicons.css'
    ],
    app: {
        head: {
            link: [
                {
                    id: 'theme-link',
                    rel: 'stylesheet',
                    href: '/themes/aura-light-blue/theme.css',
                    media: 'screen and (prefers-color-scheme: light)'
                },
                {
                    id: 'theme-link',
                    rel: 'stylesheet',
                    href: '/themes/aura-dark-blue/theme.css',
                    media: 'screen and (prefers-color-scheme: dark)'
                }
            ]
        }
    },
    components: {
        global: true,
        dirs: ['~/components']
    },
    // https://primevue.org/
    // https://vite-pwa-org.netlify.app/frameworks/nuxt
    // https://primeflex.org/
    // https://sidebase.io/nuxt-auth/getting-started
    modules: [
        "nuxt-primevue",
        "@vite-pwa/nuxt",
        "@sidebase/nuxt-auth",
        "nuxt-security",
        "nuxt-typed-router"
    ],
    // https://sidebase.io/nuxt-auth/configuration/nuxt-config
    auth: {
        isEnabled: true,
        baseURL: `${process.env.AUTH_ORIGIN}/api/auth`,
        globalAppMiddleware: true,
        provider: {
            type: 'authjs'
        },
        sessionRefresh: {
            enableOnWindowFocus: true,
            enablePeriodically: 30000
        }
    },
    runtimeConfig: {
        authSecret: process.env.AUTH_SECRET,
        githubClientId: process.env.GH_CLIENT_ID,
        githubClientSecret: process.env.GH_CLIENT_SECRET
    },
    // https://nuxt.com/modules/security
    security: {
        headers: {
            crossOriginEmbedderPolicy: process.env.NODE_ENV === 'development' ? 'unsafe-none' : 'require-corp',
            contentSecurityPolicy: {
                'img-src': ["'self'", 'data:', 'blob:', 'https://avatars.githubusercontent.com'],
            }
        },
    },
    nitro: {
        esbuild: {
            options: {
                target: 'esnext'
            }
        },
        experimental: {
            // https://nitro.unjs.io/config#openapi
            openAPI: true
            // This is very much premature as of July 2024
            // It doesn't support transactions for example
            // https://nitro.unjs.io/guide/database
            // database: true
        },
        /*
        database: {
            // stored at .data/cathedral.sqlite3
            default: {
                connector: 'sqlite',
                options: {
                    name: 'cathedral'
                }
            }
        }
        */
    },
    primevue: {

    },
    pwa: {

    },
    typescript: {
        typeCheck: true
    },
    vite: {

    }
})