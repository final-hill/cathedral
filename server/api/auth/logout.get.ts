import { defineEventHandler, sendRedirect, getRequestURL } from 'h3'

export default defineEventHandler(async (event) => {
    // Clear the user session
    await clearUserSession(event)

    // Get the OAuth configuration
    const config = useRuntimeConfig(event),
        oauthConfig = config.oauth?.microsoft

    if (!oauthConfig?.tenant) {
        // If no OAuth config, just redirect to home
        return sendRedirect(event, '/')
    }

    const tenant = oauthConfig.tenant,
        tenantDomain = tenant.replace('.onmicrosoft.com', ''),
        origin = config.origin || getRequestURL(event).origin,
        postLogoutRedirectUri = encodeURIComponent(`${origin}/`),
        logoutUrl = `https://${tenantDomain}.ciamlogin.com/${tenant}/oauth2/v2.0/logout?post_logout_redirect_uri=${postLogoutRedirectUri}`

    return sendRedirect(event, logoutUrl)
})
