import { createResolver, defineNuxtModule, extendPages } from '@nuxt/kit'

export default defineNuxtModule({
    meta: {
        name: 'environment'
    },
    setup() {
        const { resolve } = createResolver(import.meta.url)

        extendPages((pages) => {
            pages.push({
                name: 'Environment',
                path: '/solution/:solutionSlug/environment',
                file: resolve('./ui/pages/Index.vue')
            }, {
                name: 'Assumptions',
                path: '/solution/:solutionSlug/environment/assumptions',
                file: resolve('./ui/pages/Assumptions.vue')
            }, {
                name: 'Components',
                path: '/solution/:solutionSlug/environment/components',
                file: resolve('./ui/pages/Components.vue')
            }, {
                name: 'Constraints',
                path: '/solution/:solutionSlug/environment/constraints',
                file: resolve('./ui/pages/Constraints.vue')
            }, {
                name: 'Effects',
                path: '/solution/:solutionSlug/environment/effects',
                file: resolve('./ui/pages/Effects.vue')
            }, {
                name: 'Glossary',
                path: '/solution/:solutionSlug/environment/glossary',
                file: resolve('./ui/pages/Glossary.vue')
            }, {
                name: 'Invariants',
                path: '/solution/:solutionSlug/environment/invariants',
                file: resolve('./ui/pages/Invariants.vue')
            })
        })
    }
})
