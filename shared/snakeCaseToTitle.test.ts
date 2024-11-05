import { describe, it, expect } from 'vitest';
import snakeCaseToTitle from './snakeCaseToTitle';

describe('snakeCaseToTitle', () => {
    it('should convert snake_case to Title Case', () => {
        expect(snakeCaseToTitle('snake_case_string')).toBe('Snake Case String');
    });

    it('should handle single word', () => {
        expect(snakeCaseToTitle('word')).toBe('Word');
    });

    it('should handle empty string', () => {
        expect(snakeCaseToTitle('')).toBe('');
    });

    it('should handle multiple underscores', () => {
        expect(snakeCaseToTitle('multiple__underscores')).toBe('Multiple  Underscores');
    });

    it('should handle leading and trailing underscores', () => {
        expect(snakeCaseToTitle('_leading_trailing_')).toBe(' Leading Trailing ');
    });

    it('should handle numbers in the string', () => {
        expect(snakeCaseToTitle('snake_case_123')).toBe('Snake Case 123');
    });

    it('should handle mixed case input', () => {
        expect(snakeCaseToTitle('sNaKe_CaSe')).toBe('SNaKe CaSe');
    });
});