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
        'vue/no-multiple-template-root': 'off',
        'one-var': ['error', 'consecutive'],
        'curly': ['error', 'multi-or-nest'],
        'max-params': ['error', { max: 1 }],
        // Access Hungarian is a smell
        // Ref: https://thenewobjective.com/types-and-programming-languages/naming-conventions-reconsidered/
        '@typescript-eslint/naming-convention': ['error',
            {
                selector: 'default',
                format: ['camelCase'],
                leadingUnderscore: 'forbid',
                trailingUnderscore: 'forbid'
            },
            {
                // Allow snake_case for external API parameters (Slack, OAuth, etc.)
                selector: 'parameter',
                filter: {
                    regex: '^(thread_ts|error_description)$',
                    match: true
                },
                format: null,
                leadingUnderscore: 'forbid',
                trailingUnderscore: 'forbid'
            },
            {
                // Allow leading underscore for unused type parameters
                selector: 'typeParameter',
                modifiers: ['unused'],
                format: ['PascalCase'],
                leadingUnderscore: 'allow',
                trailingUnderscore: 'forbid'
            },
            {
                // Allow leading underscore for unused parameters
                selector: 'parameter',
                modifiers: ['unused'],
                format: ['camelCase'],
                leadingUnderscore: 'allow',
                trailingUnderscore: 'forbid'
            },
            {
                // Allow snake_case for external API variables
                selector: 'variable',
                filter: {
                    regex: '^(thread_ts|error_description)$',
                    match: true
                },
                format: null,
                leadingUnderscore: 'forbid',
                trailingUnderscore: 'forbid'
            },
            {
                // Allow leading underscore for unused variables (from destructuring)
                selector: 'variable',
                modifiers: ['unused'],
                format: ['camelCase', 'PascalCase'],
                leadingUnderscore: 'allow',
                trailingUnderscore: 'forbid'
            },
            {
                selector: 'variable',
                format: ['camelCase', 'PascalCase', 'UPPER_CASE'],
                leadingUnderscore: 'forbid',
                trailingUnderscore: 'forbid'
            },
            {
                // Allow PascalCase for imports (class/type imports)
                selector: 'import',
                format: ['camelCase', 'PascalCase'],
                leadingUnderscore: 'forbid',
                trailingUnderscore: 'forbid'
            },
            {
                selector: 'enumMember',
                format: ['UPPER_CASE', 'PascalCase', 'camelCase'], // Allow various formats for enum values
                leadingUnderscore: 'forbid',
                trailingUnderscore: 'forbid'
            },
            {
                // Allow underscores in MikroORM migration class names (e.g., Migration20250801000000_uuid7)
                selector: 'class',
                filter: {
                    regex: '^Migration\\d+_.+$',
                    match: true
                },
                format: null,
                leadingUnderscore: 'forbid',
                trailingUnderscore: 'forbid'
            },
            {
                selector: 'class',
                format: ['PascalCase'],
                leadingUnderscore: 'forbid',
                trailingUnderscore: 'forbid'
            },
            {
                // Allow PascalCase for mixin functions (e.g., Prioritizable)
                selector: 'function',
                format: ['camelCase', 'PascalCase'],
                leadingUnderscore: 'forbid',
                trailingUnderscore: 'forbid'
            },
            {
                selector: 'typeLike',
                format: ['PascalCase'],
                leadingUnderscore: 'forbid',
                trailingUnderscore: 'forbid'
            },
            {
                // Allow double underscore for nominal typing brands
                selector: 'property',
                filter: {
                    regex: '^__brand$',
                    match: true
                },
                format: null,
                leadingUnderscore: 'allow',
                trailingUnderscore: 'forbid'
            },
            // TODO: this is too broad. it should probably be accomplished via inline overrides
            {
                selector: 'property',
                format: null, // Allow any format for properties (e.g., database columns, _data)
                leadingUnderscore: 'allow',
                trailingUnderscore: 'forbid'
            }
        ]
    }
})
