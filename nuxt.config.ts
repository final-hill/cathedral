import { defineNuxtConfig } from 'nuxt/config'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    css: ['~/assets/css/main.css'],
    devtools: { enabled: true },
    modules: [
        // https://pinia.vuejs.org/introduction.html
        '@pinia/nuxt',
        // https://prazdevs.github.io/pinia-plugin-persistedstate/
        '@pinia-plugin-persistedstate/nuxt',
        // https://phosphoricons.com/
        "nuxt-phosphor-icons"
    ],
    spaLoadingTemplate: 'public/_loading-template.html',
    ssr: false,
    typescript: {
        typeCheck: true,
        strict: true
    }
})
