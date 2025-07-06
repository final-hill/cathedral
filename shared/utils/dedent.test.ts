import { describe, it, expect } from 'vitest'
import { dedent } from './dedent'

describe('dedent', () => {
    it('should remove leading spaces from each line', () => {
        const input = `
            line1
            line2
            line3
        `
        const expected = `
line1
line2
line3
        `
        expect(dedent(input)).toBe(expected)
    })

    it('should handle tabs correctly', () => {
        const input = `
\t\tline1
\t\tline2
\t\tline3
\t\t`
        const expected = `
line1
line2
line3
`
        expect(dedent(input)).toBe(expected)
    })

    it('should return the same string if no indentation is found', () => {
        const input = `line1\nline2\nline3`
        expect(dedent(input)).toBe(input)
    })

    it('should handle empty strings', () => {
        const input = ``
        expect(dedent(input)).toBe(input)
    })

    it('should handle strings with inconsistent indentation', () => {
        const input = `
            line1
          line2
            line3
        `
        const expected = `
  line1
line2
  line3
        `
        expect(dedent(input)).toBe(expected)
    })
})
