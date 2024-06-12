import { createResolver, defineNuxtModule, extendPages } from '@nuxt/kit'

export default defineNuxtModule({
    meta: {
        name: 'project'
    },
    setup() {
        const { resolve } = createResolver(import.meta.url)

        extendPages((pages) => {
            pages.push({
                name: 'Project',
                path: '/solution/:solutionSlug/project',
                file: resolve('./ui/pages/Index.vue')
            }, {
                name: 'Roles & Personnel',
                path: '/solution/:solutionSlug/project/roles-personnel',
                file: resolve('./ui/pages/RolesPersonnel.vue')
            })
        })
    }
})
