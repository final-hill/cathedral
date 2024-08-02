/**
 * Redirects to login page if user is not authenticated
 * (except /api/slack-bot and the /auth routes)
 */
export default eventHandler(async (event) => {
    const config = useRuntimeConfig(),
        url = event.node.req.url!

    if (url.startsWith('/auth'))
        return

    const session = await useSession(event, { password: config.sessionPassword })

    console.log('MIDDLEWARE: session.data', session.data)

    if (!session || Object.keys(session.data).length === 0) {
        if (url.startsWith('/api/slack-bot'))
            return
        if (url.startsWith('/api')) {
            throw createError({
                statusCode: 401,
                message: 'Unauthorized'
            })
        }
        sendRedirect(event, '/auth/sign-in')
    }
})