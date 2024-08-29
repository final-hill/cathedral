/**
 * Check if the solution exists. If not, redirect to the parent organization page.
 * Check if the organization exists. If not redirect to the home page.
 */
export default defineNuxtRouteMiddleware(async (to, from) => {
    if (to.params.organizationslug) {
        const { data: organizations } = await useFetch('/api/organizations', {
            query: { slug: to.params.organizationslug }
        })

        if (!(organizations?.value ?? []).length) {
            return navigateTo('/')
        } else if (to.params.solutionslug) {
            const { data: solutions } = await useFetch('/api/solutions', {
                query: {
                    organizationSlug: to.params.organizationslug,
                    slug: to.params.solutionslug
                }
            })

            if (!(solutions?.value ?? []).length)
                return navigateTo(`/o/${to.params.organizationslug}`)
        }
    }
})