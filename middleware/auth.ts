export default defineNuxtRouteMiddleware((to) => {
    const { loggedIn } = useUserSession()

    if (!loggedIn.value) {
        // Don't redirect if we're already on the auth page to prevent loops
        if (to.name === 'Auth')
            return

        // Preserve the current route as redirect parameter
        const redirectPath = to.fullPath
        return navigateTo({
            name: 'Auth',
            query: { redirect: redirectPath }
        })
    }
})