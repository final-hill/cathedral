import { defineEventHandler, sendRedirect, getRequestURL } from 'h3'

export default defineEventHandler(async (event) => {
    // Clear the user session
    await clearUserSession(event)

    // Get the OAuth configuration
    const config = useRuntimeConfig(event)
    const oauthConfig = config.oauth?.microsoft

    if (!oauthConfig?.tenant) {
        // If no OAuth config, just redirect to home
        return sendRedirect(event, '/')
    }

    const tenant = oauthConfig.tenant
    const tenantDomain = tenant.replace('.onmicrosoft.com', '')
    const origin = config.origin || getRequestURL(event).origin
    const postLogoutRedirectUri = encodeURIComponent(`${origin}/`)

    // Redirect to Entra External ID logout endpoint
    const logoutUrl = `https://${tenantDomain}.ciamlogin.com/${tenant}/oauth2/v2.0/logout?post_logout_redirect_uri=${postLogoutRedirectUri}`

    return sendRedirect(event, logoutUrl)
})
