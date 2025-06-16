export default defineNuxtRouteMiddleware((to) => {
    // Only apply guest middleware to auth pages
    const isAuthPage = to.path === '/auth' || to.path.startsWith('/auth?') || to.path.startsWith('/auth/')
    if (!isAuthPage)
        return

    const { loggedIn } = useUserSession()

    if (loggedIn.value) {
        const redirect = to.query.redirect as string

        if (redirect) {
            // Ensure proper URL decoding and navigation
            try {
                return navigateTo(decodeURIComponent(redirect))
            } catch (error) {
                console.warn('Failed to decode redirect URL:', redirect, error)
                return navigateTo(redirect)
            }
        }
        return navigateTo({ name: 'Home' })
    }
})