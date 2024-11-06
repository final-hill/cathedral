import { describe, it, expect } from 'vitest';
import { setup, createPage, url } from '@nuxt/test-utils/e2e';

describe('app', async () => {
    console.log('ENV: ', process.env)
    await setup()

    it('should render the app', async () => {
        const page = await createPage()

        await page.goto(url('/'), { waitUntil: 'hydration' })

        const title = await page.title()

        expect(title).toBe('Sign In')
    })
})