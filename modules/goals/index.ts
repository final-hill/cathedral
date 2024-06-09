import { createResolver, defineNuxtModule, extendPages } from '@nuxt/kit'

export default defineNuxtModule({
    meta: {
        name: 'goals'
    },
    setup() {
        const { resolve } = createResolver(import.meta.url)

        extendPages((pages) => {
            pages.push({
                name: 'Goals',
                path: '/solution/:solutionSlug/goals',
                file: resolve('./ui/pages/Index.vue')
            }, {
                name: 'Rationale',
                path: '/solution/:solutionSlug/goals/rationale',
                file: resolve('./ui/pages/Rationale.vue')
            }, {
                name: 'Stakeholders',
                path: '/solution/:solutionSlug/goals/stakeholders',
                file: resolve('./ui/pages/Stakeholders.vue')
            }, {
                name: 'Use Cases',
                path: '/solution/:solutionSlug/goals/use-cases',
                file: resolve('./ui/pages/UseCases.vue')
            }, {
                name: 'Obstacles',
                path: '/solution/:solutionSlug/goals/obstacles',
                file: resolve('./ui/pages/Obstacles.vue')
            }, {
                name: 'Limitations',
                path: '/solution/:solutionSlug/goals/limitations',
                file: resolve('./ui/pages/Limitations.vue')
            }, {
                name: 'Outcomes',
                path: '/solution/:solutionSlug/goals/outcomes',
                file: resolve('./ui/pages/Outcomes.vue')
            })
        })
    }
})
