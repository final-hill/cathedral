import { describe, it, expect } from 'vitest'
import { camelCaseToSnakeCase } from './camelCaseToSnakeCase'

describe('camelCaseToSnakeCase', () => {
    it('should convert camelCase to snake_case', () => {
        expect(camelCaseToSnakeCase('camelCase')).toBe('camel_case')
    })

    it('should handle single word', () => {
        expect(camelCaseToSnakeCase('word')).toBe('word')
    })

    it('should handle empty string', () => {
        expect(camelCaseToSnakeCase('')).toBe('')
    })

    it('should handle multiple camelCase words', () => {
        expect(camelCaseToSnakeCase('thisIsATestString')).toBe('this_is_a_test_string')
    })

    it('should handle strings with numbers', () => {
        expect(camelCaseToSnakeCase('testString123')).toBe('test_string123')
    })

    // trim leading and trailing whitespace
    it('should trim leading and trailing whitespace', () => {
        expect(camelCaseToSnakeCase('  test  ')).toBe('test')
    })
})
