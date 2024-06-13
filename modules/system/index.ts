import { createResolver, defineNuxtModule, extendPages } from '@nuxt/kit'

export default defineNuxtModule({
    meta: {
        name: 'system'
    },
    setup() {
        const { resolve } = createResolver(import.meta.url)

        extendPages((pages) => {
            pages.push({
                name: 'System',
                path: '/solution/:solutionSlug/system',
                file: resolve('./ui/pages/Index.vue')
            }, {
                name: 'Scenarios',
                path: '/solution/:solutionSlug/system/scenarios',
                file: resolve('./ui/pages/Scenarios.vue')
            }, {
                name: 'System Components',
                path: '/solution/:solutionSlug/system/components',
                file: resolve('./ui/pages/Components.vue')
            }, {
                name: 'Functionality',
                path: '/solution/:solutionSlug/system/functionality',
                file: resolve('./ui/pages/Functionality.vue')
            })
        })
    }
})
