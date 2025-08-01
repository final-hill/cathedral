export default defineNuxtRouteMiddleware((to) => {
    const { loggedIn } = useUserSession()

    if (loggedIn.value) {
        const redirectPath = to.query.redirect as string
        if (redirectPath && redirectPath.startsWith('/')) {
            return navigateTo(redirectPath)
        }
        return navigateTo('/')
    }
})
