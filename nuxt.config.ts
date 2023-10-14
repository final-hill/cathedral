import { defineNuxtConfig } from 'nuxt/config'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    app: {
        head: {
            title: 'Cathedral'
        }
    },
    css: ['~/assets/css/main.css'],
    devtools: { enabled: true },
    modules: [
        // https://phosphoricons.com/
        "nuxt-phosphor-icons"
    ],
    sourcemap: {
        client: true
    },
    spaLoadingTemplate: 'public/_loading-template.html',
    ssr: false,
    typescript: {
        typeCheck: true,
        strict: true
    }
})
