// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  ssr: false,
  css: [
    '~/assets/css/main.css',
    'primevue/resources/themes/aura-dark-noir/theme.css',
    'primevue/resources/themes/aura-light-blue/theme.css',
    'primeflex/primeflex.css',
    'primeicons/primeicons.css'
  ],
  app: {
    head: {
      link: [
        {
          id: 'theme-link',
          rel: 'stylesheet',
          href: '/themes/aura-light-blue/theme.css'
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
  primevue: {

  },
  pwa: {

  },
  typescript: {
    typeCheck: true
  }
})