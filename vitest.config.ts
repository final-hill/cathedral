import { defineConfig } from 'vitest/config'
import { defineVitestProject } from '@nuxt/test-utils/config'

export default defineConfig({
    test: {
        projects: [
            // Unit tests that don't need Nuxt runtime
            {
                test: {
                    name: 'unit',
                    include: ['shared/**/*.test.ts', 'server/**/*.test.ts'],
                    environment: 'node'
                }
            },
            // E2E tests using @nuxt/test-utils/e2e (builds and runs Nuxt server)
            {
                test: {
                    name: 'e2e',
                    include: ['e2e/**/*.test.ts'],
                    environment: 'node'
                }
            },
            // Nuxt runtime tests for components/composables (slower, needs Nuxt context)
            await defineVitestProject({
                test: {
                    name: 'nuxt',
                    include: ['app/**/*.nuxt.test.ts'],
                    environment: 'nuxt'
                }
            })
        ]
    }
})
