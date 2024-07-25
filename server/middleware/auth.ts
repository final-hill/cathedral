import { getServerSession } from '#auth'

/**
 * Redirects to login page if user is not authenticated
 * when accessing an API route (except /api/auth)
 *
 * https://h3.unjs.io/utils/request#getrequesturlevent-opts-xforwardedhost-xforwardedproto
 */
export default eventHandler(async (event) => {
    const url = event.node.req.url!

    if (url.startsWith("/api/auth") || !url.startsWith("/api"))
        return

    const session = await getServerSession(event)
    if (!session || !session.user?.email)
        throw createError({ statusMessage: "Unauthenticated", statusCode: 403 })
})