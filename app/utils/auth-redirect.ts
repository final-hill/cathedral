/**
 * Utilities for handling authentication redirects without URL parameters
 */

/**
 * Store a redirect path for after authentication
 * @param path The path to redirect to after login
 */
export function storeAuthRedirect(path: string) {
    if (import.meta.client)
        sessionStorage.setItem('auth-redirect', path)
}

/**
 * Get and clear the stored redirect path
 * @returns The stored redirect path, or null if none exists
 */
export function getAndClearAuthRedirect(): string | null {
    if (import.meta.client) {
        const redirect = sessionStorage.getItem('auth-redirect')
        if (redirect) {
            sessionStorage.removeItem('auth-redirect')
            return redirect
        }
    }
    return null
}

/**
 * Check if there's a pending auth redirect
 * @returns True if there's a stored redirect path
 */
export function hasPendingAuthRedirect(): boolean {
    if (import.meta.client)
        return sessionStorage.getItem('auth-redirect') !== null

    return false
}
