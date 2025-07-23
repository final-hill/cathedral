import devtoolsJson from 'vite-plugin-devtools-json'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    // https://vite-pwa-org.netlify.app/frameworks/nuxt
    // https://icones.js.org/collection/lucide
    // https://nuxt.com/modules/auth-utils
    modules: ['@nuxt/ui', '@vite-pwa/nuxt', 'nuxt-security', '@nuxt/test-utils/module', '@nuxt/eslint', 'nuxt-auth-utils'],
    // SSR is disabled because this application is designed as a Single Page Application (SPA),
    // and server-side rendering is not required for its functionality.
    ssr: false,
    components: {
        global: true,
        dirs: ['~/components']
    },
    devtools: {
        enabled: process.env.NODE_ENV === 'development'
    },
    css: [
        '~/assets/css/main.css'
    ],
    runtimeConfig: {
        // The private keys which are only available within server-side

        // These values are overwritten by the associated NUXT_ environment variables in the .env file
        sessionPassword: '',
        origin: '',
        port: '',

        slackAppToken: '',
        slackSigningSecret: '',
        slackClientSecret: '',
        slackBotToken: '',
        slackLinkSecret: '',
        slackOauthOrigin: '', // For OAuth callbacks (supports ngrok tunneling)

        azureOpenaiApiKey: '',
        azureOpenaiApiVersion: '',
        azureOpenaiEndpoint: '',
        azureOpenaiDeploymentId: '',

        // System user configuration (Entra External ID Object IDs)
        systemUserId: '',
        systemUserName: '',
        systemUserEmail: '',
        systemSlackUserId: '',
        systemSlackUserName: '',
        systemSlackUserEmail: '',

        // OAuth configuration for Entra External ID
        oauth: {
            microsoft: {
                clientId: '',
                clientSecret: '',
                tenant: '',
                redirectURL: ''
            }
        },

        // The public keys which are available both client-side and server-side
        // These values are overwritten by the associated NUXT_PUBLIC_ environment variables in the .env file
        public: {
            slackAppId: '',
            slackClientId: ''
        }
    },
    routeRules: {
        '/api/slack': {
            security: {
                xssValidator: false
            }
        },
        '/api/slack/oauth/**': {
            security: {
                xssValidator: false
            }
        }
    },
    sourcemap: process.env.NODE_ENV === 'development',
    devServer: {
        https: {
            key: './cert/localhost.key',
            cert: './cert/localhost.crt'
        },
        cors: {
            origin: ['https://cathedral.localhost']
        },
        host: 'cathedral.localhost',
        url: 'https://cathedral.localhost'
    },
    experimental: {
        decorators: true,
        viewTransition: true,
        typedPages: true
    },
    compatibilityDate: '2025-04-14',
    nitro: {
        esbuild: {
            options: {
                target: 'esnext',
                // https://github.com/vitejs/vite/issues/13736
                // https://github.com/nuxt/nuxt/issues/29279#issuecomment-2395293514
                tsconfigRaw: {
                    compilerOptions: {
                        experimentalDecorators: true,
                        // @ts-expect-error - emitDecoratorMetadata is not typed in TypeScript config
                        emitDecoratorMetadata: true
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
        }
    },
    vite: {
        esbuild: {
            // https://github.com/vitejs/vite/issues/13736
            // https://github.com/nuxt/nuxt/issues/29279#issuecomment-2395293514
            tsconfigRaw: {
                compilerOptions: {
                    experimentalDecorators: true,
                    // @ts-expect-error - emitDecoratorMetadata is not typed in TypeScript config
                    emitDecoratorMetadata: true
                }
            }
        },
        plugins: [
            // https://github.com/ChromeDevTools/vite-plugin-devtools-json
            devtoolsJson()
        ],
        server: {
            hmr: {
                protocol: 'wss',
                host: '0.0.0.0'
            }
        }
    },
    typescript: {
        typeCheck: true
    },
    primevue: {},
    pwa: {},
    // https://nuxt.com/modules/security
    security: {
        headers: {
            crossOriginEmbedderPolicy: process.env.NODE_ENV === 'development' ? 'unsafe-none' : 'require-corp',
            contentSecurityPolicy: {
                'img-src': ['\'self\'', 'data:', 'blob:', 'https://avatars.githubusercontent.com', 'https://platform.slack-edge.com']
            }
        },
        rateLimiter: false
    }
})
