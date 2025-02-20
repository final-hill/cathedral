import { describe, it, expect } from 'vitest';
import { snakeCaseToPascalCase } from './snakeCaseToPascalCase';

describe('snakeCaseToPascalCase', () => {
    it('should convert snake_case to PascalCase', () => {
        expect(snakeCaseToPascalCase('snake_case_string')).toBe('SnakeCaseString');
    });

    it('should handle empty strings', () => {
        expect(snakeCaseToPascalCase('')).toBe('');
    });

    it('should handle strings without underscores', () => {
        expect(snakeCaseToPascalCase('noUnderscores')).toBe('NoUnderscores');
    });

    it('should handle strings with multiple underscores', () => {
        expect(snakeCaseToPascalCase('multiple__underscores')).toBe('MultipleUnderscores');
    });

    it('should handle strings with leading and trailing underscores', () => {
        expect(snakeCaseToPascalCase('_leading_and_trailing_')).toBe('LeadingAndTrailing');
    });

    it('should handle strings with only underscores', () => {
        expect(snakeCaseToPascalCase('_____')).toBe('');
    });
})