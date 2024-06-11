import { createResolver, defineNuxtModule, extendPages } from '@nuxt/kit'

export default defineNuxtModule({
    meta: {
        name: 'solution'
    },
    setup() {
        const { resolve } = createResolver(import.meta.url)

        extendPages((pages) => {
            pages.push({
                name: 'Solutions',
                path: '/solution',
                file: resolve('./ui/pages/solution/index.vue')
            }, {
                name: 'New Solution',
                path: '/solution/new-entry',
                file: resolve('./ui/pages/solution/new-entry.vue')
            }, {
                name: 'Edit Solution',
                path: '/solution/:solutionSlug/edit-entry',
                file: resolve('./ui/pages/solution/edit-entry.vue')
            }, {
                name: 'Solution',
                path: '/solution/:solutionSlug',
                file: resolve('./ui/pages/solution/[solutionSlug].vue')
            })
        })
    }
})
