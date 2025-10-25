/**
 * Test-only endpoint for setting user sessions
 * This endpoint should ONLY be available in test environment
 *
 * Usage in E2E tests:
 * await $fetch('/api/test/set-session', {
 *     method: 'POST',
 *     body: { userType: 'sysAdmin' }
 * })
 */

import { AppRole } from '../../../shared/domain/application/AppRole'
import type { User } from '#auth-utils'

export default defineEventHandler(async (event) => {
    // SECURITY: Only allow in test environment
    if (process.env.NODE_ENV !== 'test') {
        throw createError({
            statusCode: 404,
            message: 'Not found'
        })
    }

    const body = await readBody(event),
        { userType, customData } = body,

        // Define test users (matching e2e/helpers/session-helpers.ts and auth.d.ts User interface)
        testUsers: Record<string, User> = {
            sysAdmin: {
                id: 'test-sysadmin-id',
                name: 'Test System Admin',
                email: 'test-sysadmin@example.com',
                avatar: null,
                isSystemAdmin: true,
                organizationRoles: []
            },
            orgAdmin: {
                id: 'test-orgadmin-id',
                name: 'Test Org Admin',
                email: 'test-orgadmin@example.com',
                avatar: null,
                isSystemAdmin: false,
                organizationRoles: [{
                    orgId: 'test-org-1',
                    role: AppRole.ORGANIZATION_ADMIN
                }]
            },
            user: {
                id: 'test-user-id',
                name: 'Test User',
                email: 'test-user@example.com',
                avatar: null,
                isSystemAdmin: false,
                organizationRoles: [{
                    orgId: 'test-org-1',
                    role: AppRole.ORGANIZATION_CONTRIBUTOR
                }]
            }
        },

        userData = {
            ...testUsers[userType],
            ...customData
        }

    if (!userData.id) {
        throw createError({
            statusCode: 400,
            message: `Invalid userType: ${userType}. Valid types: ${Object.keys(testUsers).join(', ')}`
        })
    }

    // Set the session using nuxt-auth-utils
    await setUserSession(event, {
        user: userData
    })

    return {
        success: true,
        user: userData
    }
})
