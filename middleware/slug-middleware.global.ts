export default defineNuxtRouteMiddleware(async (to, from) => {
    let slug = to.params.slug

    if (slug) {
        slug = typeof slug === 'string' ? slug : slug[0]

        const solution = await $fetch(`/api/solutions`, {
            query: { slug }
        })

        if (!solution)
            return navigateTo({ name: 'Solutions' })
    }
})