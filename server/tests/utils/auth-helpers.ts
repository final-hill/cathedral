/**
 * Test utilities for authentication and authorization testing
 */

import { vi } from 'vitest'
import { AppRole } from '../../../shared/domain/application/AppRole'

// Define User type to match auth.d.ts (can't import #auth-utils in unit test environment)
interface User {
    id: string
    email: string
    name: string
    avatar?: string | null
    isSystemAdmin: boolean
    organizationRoles: Array<{ orgId: string, role: AppRole }>
}

/**
 * Mock user profiles for different roles
 */
export const mockUsers = {
    sysAdmin: {
        id: 'test-sysadmin-id',
        name: 'Test System Admin',
        email: 'test-sysadmin@example.com',
        avatar: null,
        isSystemAdmin: true,
        organizationRoles: [] as Array<{ orgId: string, role: AppRole }>
    } satisfies User,
    orgAdmin: {
        id: 'test-orgadmin-id',
        name: 'Test Org Admin',
        email: 'test-orgadmin@example.com',
        avatar: null,
        isSystemAdmin: false,
        organizationRoles: [{
            orgId: 'test-org-1',
            role: AppRole.ORGANIZATION_ADMIN
        }] as Array<{ orgId: string, role: AppRole }>
    } satisfies User,
    user: {
        id: 'test-user-id',
        name: 'Test User',
        email: 'test-user@example.com',
        avatar: null,
        isSystemAdmin: false,
        organizationRoles: [{
            orgId: 'test-org-1',
            role: AppRole.ORGANIZATION_CONTRIBUTOR
        }] as Array<{ orgId: string, role: AppRole }>
    } satisfies User,
    anonymous: null
}

/**
 * Create a mock session for testing
 */
export function createMockSession(userType: keyof typeof mockUsers): { user: User } | null {
    const user = mockUsers[userType]
    return user ? { user } : null
}

/**
 * Mock the useUserSession composable for testing
 * Use this in your test setup
 */
export function mockUserSession(userType: keyof typeof mockUsers = 'anonymous') {
    const user = mockUsers[userType]

    return {
        loggedIn: vi.fn().mockReturnValue(!!user),
        user: vi.fn().mockReturnValue(user),
        session: vi.fn().mockReturnValue(user ? { user } : null),
        fetch: vi.fn(),
        clear: vi.fn()
    }
}
