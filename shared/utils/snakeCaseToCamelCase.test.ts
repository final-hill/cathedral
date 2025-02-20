import { describe, it, expect } from 'vitest';
import { snakeCaseToCamelCase } from './snakeCaseToCamelCase';

describe('snakeCaseToCamelCase', () => {
    it('should convert snake_case to camelCase', () => {
        expect(snakeCaseToCamelCase('snake_case_string')).toBe('snakeCaseString');
    });

    it('should handle empty strings', () => {
        expect(snakeCaseToCamelCase('')).toBe('');
    });

    it('should handle strings without underscores', () => {
        expect(snakeCaseToCamelCase('noUnderscores')).toBe('noUnderscores');
    });

    it('should handle strings with multiple underscores', () => {
        expect(snakeCaseToCamelCase('multiple__underscores')).toBe('multipleUnderscores');
    });

    it('should handle strings with leading and trailing underscores', () => {
        expect(snakeCaseToCamelCase('_leading_and_trailing_')).toBe('leadingAndTrailing');
    });

    it('should handle strings with only underscores', () => {
        expect(snakeCaseToCamelCase('_____')).toBe('');
    });
});