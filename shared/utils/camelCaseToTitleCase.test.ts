import { describe, it, expect } from 'vitest'
import { camelCaseToTitleCase } from './camelCaseToTitleCase'

describe('camelCaseToTitleCase', () => {
    it('should convert camelCase to Title Case', () => {
        expect(camelCaseToTitleCase('camelCaseString')).toBe('Camel Case String')
    })

    it('should handle single word', () => {
        expect(camelCaseToTitleCase('word')).toBe('Word')
    })

    it('should handle empty string', () => {
        expect(camelCaseToTitleCase('')).toBe('')
    })

    it('should handle multiple camelCase words', () => {
        expect(camelCaseToTitleCase('thisIsATestString')).toBe('This Is A Test String')
    })

    it('should handle strings with numbers', () => {
        expect(camelCaseToTitleCase('testString123')).toBe('Test String123')
    })

    // trim leading and trailing whitespace
    it('should trim leading and trailing whitespace', () => {
        expect(camelCaseToTitleCase('  test  ')).toBe('Test')
    })
})
