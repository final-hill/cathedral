import { describe, it, expect } from 'vitest'
import { slugToSnakeCase } from './slugToSnakeCase'

describe('slugToSnakeCase', () => {
    it('should convert slug (kebab-case) to snake_case', () => {
        expect(slugToSnakeCase('kebab-case-string')).toBe('kebab_case_string')
        expect(slugToSnakeCase('glossary-term')).toBe('glossary_term')
        expect(slugToSnakeCase('environment-component')).toBe('environment_component')
        expect(slugToSnakeCase('simple')).toBe('simple')
        expect(slugToSnakeCase('')).toBe('')
    })
})
