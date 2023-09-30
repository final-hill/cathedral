import { defineNuxtConfig } from 'nuxt/config'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    css: ['~/assets/css/main.css'],
    devtools: { enabled: true },
    ssr: false,
    spaLoadingTemplate: 'public/_loading-template.html',
    modules: [
        // https://nuxt.com/modules/icon
        // https://icones.js.org/
        'nuxt-icon'
    ]
})
