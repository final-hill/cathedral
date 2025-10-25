/**
 * E2E Test Session Helpers
 *
 * Uses the test session API endpoint to set user sessions for E2E tests.
 * This ensures the session is properly established on both server and client.
 */

import type { Page } from '@playwright/test'
import { expect } from 'vitest'

/**
 * Mock user profiles for testing (must match server/api/test/set-session.post.ts)
 */
export const mockUsers = {
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
            role: 'Organization Admin' as const
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
            role: 'Organization Contributor' as const
        }]
    }
} as const

export type TestUserType = keyof typeof mockUsers

/**
 * Authenticate as a test user by calling the API endpoint
 * This sets the session server-side and returns the session cookie
 */
export async function authenticateAs(options: { page: Page, userType: TestUserType }) {
    const { page, userType } = options,

        // Call the API endpoint to set the session
        response = await page.request.post('/api/test/set-session', {
            data: {
                userType,
                user: mockUsers[userType]
            }
        })

    if (!response.ok())
        throw new Error(`Failed to authenticate as ${userType}: ${response.status()}`)

    // The API should have set the session cookie, but in SPA mode we might need to refresh
    // Force a navigation to ensure the session is properly loaded
    await page.goto('/') // Navigate to trigger session loading
    await page.waitForLoadState('networkidle')
}

/**
 * Helper to get URL with test user parameter (for middleware fallback)
 */
export function getTestUrl(options: { baseUrl: string, userType?: TestUserType }): string {
    if (!options.userType)
        return options.baseUrl
    const url = new URL(options.baseUrl, 'http://localhost')
    url.searchParams.set('testUser', options.userType)
    return url.pathname + url.search
}

/**
 * Verify user information in the profile menu
 */
export async function verifyUserInfo(options: { page: Page, email: string, name: string }) {
    const { page, email, name } = options,

        // Click the profile menu to open it
        profileButton = await page.getByTestId('profile-button')
    await profileButton.click()

    // Wait for dropdown to appear and be visible
    await page.waitForTimeout(1000)

    // Check for user email in the menu with better selector
    const userEmailElement = await page.locator('.profile-menu_user-email').first()
    await userEmailElement.waitFor({ state: 'visible', timeout: 10000 })
    const emailText = await userEmailElement.textContent()
    expect(emailText?.trim()).toBe(email)

    // Check for user name in the menu with better selector
    const userNameElement = await page.locator('.profile-menu_user-name').first()
    await userNameElement.waitFor({ state: 'visible', timeout: 10000 })
    const nameText = await userNameElement.textContent()
    expect(nameText?.trim()).toBe(name)
}
