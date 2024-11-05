// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    compatibilityDate: '2024-11-05',
    devtools: {
        enabled: process.env.NODE_ENV === 'development'
    },
    devServer: {
        https: {
            key: './cert/localhost.key',
            cert: './cert/localhost.crt'
        }
    },
    experimental: {
        typedPages: true
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
        // The latest version (^1.5.0) is needed due to https://github.com/nuxt/devtools/issues/723
        // It looks like this won't be integrated into Nuxt until after 3.14.0
        '@nuxt/devtools',
        'nuxt-primevue',
        '@vite-pwa/nuxt',
        '@sidebase/nuxt-auth',
        'nuxt-security',
        '@nuxt/test-utils/module',
    ],
    runtimeConfig: {
        // The private keys which are only available within server-side

        // These values are overwritten by the associated NUXT_ environment variables in the .env file
        authClientId: '',
        authClientSecret: '',
        authRedirectUri: '',
        authAuthorityDomain: '',
        authSignUpSignInAuthority: '',
        authEditProfileAuthority: '',
        authTenantName: '',
        authTenantId: '',
        authPrimaryUserFlow: '',
        sessionPassword: '',
        origin: '',
        port: '',

        slackAppToken: '',
        slackSigningSecret: '',
        slackClientId: '',
        slackClientSecret: '',
        slackBotToken: '',

        azureOpenaiApiKey: '',
        azureOpenaiApiVersion: '',
        azureOpenaiEndpoint: '',
        azureOpenaiDeploymentId: '',

        // The public keys which are available both client-side and server-side
        public: {}
    },
    // https://auth.sidebase.io/guide/application-side/configuration
    // https://sidebase.io/nuxt-auth/configuration/nuxt-config
    auth: {
        isEnabled: true,
        disableServerSideAuth: false,
        baseURL: `${process.env.NUXT_ORIGIN}/api/auth`,
        // https://auth.sidebase.io/guide/application-side/protecting-pages#global-middleware
        globalAppMiddleware: true,
        provider: {
            type: 'authjs',
        },
        sessionRefresh: {
            enableOnWindowFocus: true,
            enablePeriodically: 30000
        }
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
    routeRules: {
        '/api/slack': {
            security: {
                xssValidator: false
            }
        }
    },
    nitro: {
        esbuild: {
            options: {
                target: "esnext",
                // https://github.com/vitejs/vite/issues/13736
                // https://github.com/nuxt/nuxt/issues/29279#issuecomment-2395293514
                tsconfigRaw: {
                    compilerOptions: {
                        experimentalDecorators: true,
                        // @ts-expect-error: Is this even doing anything?
                        emitDecoratorMetadata: true,
                        declaration: true
                    }
                }
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
    primevue: {},
    pwa: {},
    typescript: {
        typeCheck: true
    },
    vite: {
        esbuild: {
            // https://github.com/vitejs/vite/issues/13736
            // https://github.com/nuxt/nuxt/issues/29279#issuecomment-2395293514
            tsconfigRaw: {
                compilerOptions: {
                    experimentalDecorators: true,
                    // @ts-expect-error: Is this even doing anything?
                    emitDecoratorMetadata: true,
                    declaration: true
                }
            }
        },
        server: {
            hmr: {
                protocol: 'wss',
                host: '0.0.0.0'
            }
        }
    }
})