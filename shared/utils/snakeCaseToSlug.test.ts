import { describe, it, expect } from 'vitest'
import { snakeCaseToSlug } from './snakeCaseToSlug'

describe('snakeCaseToSlug', () => {
    it('should convert snake_case to slug', () => {
        expect(snakeCaseToSlug('snake_case_string')).toBe('snake-case-string')
    })

    it('should handle empty strings', () => {
        expect(snakeCaseToSlug('')).toBe('')
    })

    it('should handle strings without underscores', () => {
        expect(snakeCaseToSlug('noUnderscores')).toBe('noUnderscores')
    })

    it('should handle strings with multiple underscores', () => {
        expect(snakeCaseToSlug('multiple__underscores')).toBe('multiple--underscores')
    })

    it('should handle strings with leading and trailing underscores', () => {
        expect(snakeCaseToSlug('_leading_and_trailing_')).toBe('-leading-and-trailing-')
    })

    it('should handle strings with only underscores', () => {
        expect(snakeCaseToSlug('_____')).toBe('-----')
    })
})
