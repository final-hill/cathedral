/**
 * Check if the solution exists. If not, redirect to the parent organization page.
 * Check if the organization exists. If not redirect to the home page.
 */
export default defineNuxtRouteMiddleware(async (to, from) => {
    // @ts-expect-error : For some reason the typed params are not being recognized
    const { organizationslug, solutionslug } = to.params

    if (organizationslug) {
        const organizations = await $fetch('/api/organization', {
            query: { slug: organizationslug }
        })

        if (!(organizations ?? []).length) {
            return navigateTo('/')
        } else if (solutionslug) {
            const solutions = await $fetch('/api/solution', {
                query: {
                    organizationSlug: organizationslug,
                    slug: solutionslug
                }
            })

            if (!(solutions ?? []).length)
                return navigateTo(`/o/${organizationslug}`)
        }
    }
})