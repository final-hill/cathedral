import { getServerSession } from '#auth'

/**
 * Redirects to login page if user is not authenticated
 * when accessing an API route (except /api/auth)
 */
export default eventHandler(async (event) => {
    const url = event.node.req.url!

    if (url.startsWith('/api/slack') || url.startsWith("/api/auth") || !url.startsWith("/api"))
        return

    const session = await getServerSession(event)

    if (!session) {
        throw createError({
            statusMessage: 'Unauthenticated',
            statusCode: 403
        })
    }
})

