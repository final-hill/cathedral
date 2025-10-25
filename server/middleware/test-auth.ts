/**
 * Test Authentication Middleware
 *
 * Automatically authenticates users in test environment based on a header or query parameter.
 * This allows E2E tests to specify which user to authenticate as without
 * needing to go through the actual Entra login flow.
 *
 * Only active when NODE_ENV=test or when testUser query param is present
 */

interface TestUser {
    id: string
    name: string
    email: string
    roles: string[]
}

export default defineEventHandler(async (event) => {
    // Get the test user type from header or query parameter
    const testUserType = getHeader(event, 'x-test-user') || getQuery(event).testUser as string

    // Only run if test user is specified (implicit test mode detection)
    if (!testUserType)
        return

    // Check if there's already a session
    const session = await getUserSession(event)
    if (session.user)
        return // Already authenticated

    // Define test users
    const testUsers: Record<string, TestUser> = {
            sysAdmin: {
                id: 'test-sysadmin-id',
                name: 'Test System Admin',
                email: 'test-sysadmin@example.com',
                roles: ['sysadmin']
            },
            orgAdmin: {
                id: 'test-orgadmin-id',
                name: 'Test Org Admin',
                email: 'test-orgadmin@example.com',
                roles: ['orgadmin']
            },
            user: {
                id: 'test-user-id',
                name: 'Test User',
                email: 'test-user@example.com',
                roles: ['user']
            }
        },

        testUser = testUsers[testUserType]

    if (testUser) {
        // Log for debugging
        console.log(`[test-auth] Authenticating as ${testUserType}:`, testUser.email)

        // Set the user session for this test user
        await setUserSession(event, {
            user: testUser,
            loggedInAt: new Date().toISOString()
        })
    }
})
