function isSafeRedirectPath(path: string): boolean {
    // Must start with a single slash, not double slash
    if (!path || !path.startsWith('/')) return false;
    if (path.startsWith('//')) return false;
    if (path.includes('\\')) return false;
    // Optionally, disallow control chars or suspicious patterns
    // Only allow relative paths, not protocol-relative or absolute URLs
    try {
        // This will throw if path is not a valid URL when used as relative
        new URL(path, 'http://example.com');
    } catch {
        return false;
    }
    return true;
}

export default defineNuxtRouteMiddleware((to) => {
    const { loggedIn } = useUserSession()

    if (loggedIn.value) {
        const redirectPath = to.query.redirect as string
        if (redirectPath && isSafeRedirectPath(redirectPath)) {
            return navigateTo(redirectPath)
        }
        return navigateTo('/')
    }
})
