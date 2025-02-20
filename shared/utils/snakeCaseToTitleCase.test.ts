import { describe, it, expect } from 'vitest';
import { snakeCaseToTitleCase } from './snakeCaseToTitleCase';

describe('snakeCaseToTitleCase', () => {
    it('should convert snake_case to Title Case', () => {
        expect(snakeCaseToTitleCase('snake_case_string')).toBe('Snake Case String');
    });

    it('should handle single word', () => {
        expect(snakeCaseToTitleCase('word')).toBe('Word');
    });

    it('should handle empty string', () => {
        expect(snakeCaseToTitleCase('')).toBe('');
    });

    it('should handle multiple underscores', () => {
        expect(snakeCaseToTitleCase('multiple__underscores')).toBe('Multiple  Underscores');
    });

    it('should handle leading and trailing underscores', () => {
        expect(snakeCaseToTitleCase('_leading_trailing_')).toBe(' Leading Trailing ');
    });

    it('should handle numbers in the string', () => {
        expect(snakeCaseToTitleCase('snake_case_123')).toBe('Snake Case 123');
    });

    it('should handle mixed case input', () => {
        expect(snakeCaseToTitleCase('sNaKe_CaSe')).toBe('SNaKe CaSe');
    });
});