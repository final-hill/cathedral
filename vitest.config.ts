import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
    test: {
        environment: 'node',
        globals: true,
        include: [
            '**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'
        ],
        exclude: [
            '**/node_modules/**',
            '**/dist/**',
            '**/.{idea,git,cache,output,temp}/**',
            '**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build,eslint,prettier}.config.*'
        ]
    },
    resolve: {
        alias: {
            '~': resolve(__dirname, '.'),
            '@': resolve(__dirname, '.'),
            '#shared': resolve(__dirname, 'shared')
        }
    }
})
