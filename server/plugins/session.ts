export default defineNitroPlugin(() => {
    // Called when the session is fetched during SSR for the Vue composable (/api/_auth/session)
    // Or when we call useUserSession().fetch()
    // eslint-disable-next-line max-params
    sessionHooks.hook('fetch', async (_session, _event) => {
        // extend User Session by calling the database
        // or
        // throw createError({ ... }) if session is invalid for example
    })

    // Called when we call useUserSession().clear() or clearUserSession(event)
    // eslint-disable-next-line max-params
    sessionHooks.hook('clear', async (_session, _event) => {
        // Log that user logged out
    })
})
