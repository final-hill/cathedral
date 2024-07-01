// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    devtools: { enabled: true },
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
    modules: ["nuxt-primevue", "@vite-pwa/nuxt"],
    nitro: {
        // ref: https://github.com/nuxt/nuxt/issues/21756
        esbuild: {
            options: {
                tsconfigRaw: {
                    compilerOptions: {
                        experimentalDecorators: true,
                        // emitDecoratorMetadata: true
                    }
                }
            }
        }
    },
    primevue: {

    },
    pwa: {

    },
    typescript: {
        typeCheck: false
    },
    vite: {
        optimizeDeps: {
            exclude: ['@electric-sql/pglite']
        }
    }
})
