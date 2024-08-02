export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig();

    await clearSession(event, {
        password: config.sessionPassword
    })

    const logoutUri = `${config.authSignUpSignInAuthority}/oauth2/v2.0/logout?post_logout_redirect_uri=${config.origin}`

    sendRedirect(event, logoutUri)
})