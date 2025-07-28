export default defineNuxtRouteMiddleware(async (to) => {
    const { loggedIn } = useUserSession()

    if (!loggedIn.value) {
        // Store the intended destination in sessionStorage (client-side only)
        if (import.meta.client && to.fullPath !== '/') {
            sessionStorage.setItem('auth-redirect', to.fullPath)
        }
        return navigateTo('/auth', { external: true })
    }
})
