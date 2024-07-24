/**
 * Check if the solution exists. If not, redirect to the parent organization page.
 * Check if the organization exists. If notm redirect to the home page.
 */
export default defineNuxtRouteMiddleware(async (to, from) => {
    // FIXME: some type of bug in the login flow tries to navigate to /sw.js
    if (to.path === '/sw.js')
        return navigateTo('/')

    // const [{ data: solutions }, { data: organizations }] = await Promise.all([
    //     to.params.solutionSlug ? useFetch(`/api/solutions?slug=${to.params.solutionSlug}`, { cache: 'default' }) : { data: null },
    //     to.params.organizationslug ? useFetch(`/api/organizations?slug=${to.params.organizationslug}`, { cache: 'default' }) : { data: null }
    // ])

    // if (!(solutions?.value ?? []).length)
    //     return navigateTo(`/${to.params.organizationslug}`)

    // if (!(organizations?.value ?? []).length)
    //     return navigateTo('/')
})