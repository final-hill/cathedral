/**
 * Real Entra login helper (use sparingly for smoke tests)
 * Extracted from the original test for reuse
 */
import type { Page } from '@playwright/test'
import { url } from '@nuxt/test-utils/e2e'

/**
 * Perform actual Entra External ID login
 * This is slow but tests the complete authentication flow
 *
 * @param page - Playwright page instance
 * @returns The authenticated page
 */
export async function loginWithEntra(page: Page): Promise<Page> {
    const sysAdminEmail = process.env.NUXT_SYSTEM_USER_EMAIL!,
        sysAdminPassword = process.env.NUXT_SYSTEM_USER_PASSWORD!

    if (!sysAdminEmail || !sysAdminPassword)
        throw new Error('NUXT_SYSTEM_USER_EMAIL and NUXT_SYSTEM_USER_PASSWORD must be set in .env.test')

    await page.goto(url('/'))

    // Wait for Entra login page
    const titleText = await page.textContent('title')
    if (!titleText?.includes('Sign in to your account'))
        console.warn('Expected Entra login page but got:', titleText)

    // Enter email
    const emailInput = await page.waitForSelector('input[type="email"]', { timeout: 10000 })
    await emailInput.fill(sysAdminEmail)

    // Click Next
    const nextButton = await page.waitForSelector('input[value="Next"]')
    await nextButton.click()

    // Wait for and enter password
    const passwordInput = await page.waitForSelector('input[type="password"]', { timeout: 10000 })
    await passwordInput.fill(sysAdminPassword)

    // Click Sign in
    const signInButton = await page.waitForSelector('input[value="Sign in"]')
    await signInButton.click()

    // Handle "Stay signed in?" prompt
    const staySignedInPanel = await page.waitForSelector('div:has-text("Stay signed in?")', { timeout: 10000 }),
        noButton = await staySignedInPanel.$('input[value="No"]')
    if (noButton)
        await noButton.click()

    // Wait for successful authentication
    await page.waitForSelector('[data-testid="profile-menu"]', { timeout: 10000 })

    return page
}

/**
 * Verify a user is logged in with specific details
 */
export async function verifyUserLoggedIn(options: {
    page: Page
    expectedEmail: string
    expectedName: string
}) {
    const { page, expectedEmail, expectedName } = options,

        // Wait for profile menu
        profileMenu = await page.waitForSelector('[data-testid="profile-menu"]', { timeout: 5000 })

    // Click to open dropdown
    await profileMenu.click()

    // Verify email
    const userEmailElement = await page.waitForSelector('.profile-menu_user-email', { timeout: 2000 }),
        userEmailText = await userEmailElement?.textContent()

    if (userEmailText !== expectedEmail)
        throw new Error(`Expected email "${expectedEmail}" but got "${userEmailText}"`)

    // Verify name
    const userNameElement = await page.waitForSelector('.profile-menu_user-name'),
        userNameText = await userNameElement?.textContent()

    if (userNameText !== expectedName)
        throw new Error(`Expected name "${expectedName}" but got "${userNameText}"`)
}
