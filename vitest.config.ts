import { defineVitestConfig } from '@nuxt/test-utils/config'
import type { UserConfig } from 'vitest/node'

export default defineVitestConfig({
    test: {
        environment: 'nuxt'
    }
}) as UserConfig
