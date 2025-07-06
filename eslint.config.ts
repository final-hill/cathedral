import { createConfigForNuxt } from '@nuxt/eslint-config/flat'

export default createConfigForNuxt({
    features: {
        stylistic: {
            braceStyle: '1tbs',
            indent: 4,
            commaDangle: 'never' // Disable trailing commas - commas are separators, not terminators
        }
    }
}).append({
    rules: {
        'vue/no-multiple-template-root': 'off'
    }
})
