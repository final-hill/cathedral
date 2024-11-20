import { describe, it, expect } from 'vitest';
import { camelCaseToSlug } from './camelCaseToSlug';

describe('camelCaseToSlug', () => {
    it('should convert single camelCase word to slug', () => {
        expect(camelCaseToSlug('camelCase')).toBe('camel-case');
    });

    it('should convert multiple camelCase words to slug', () => {
        expect(camelCaseToSlug('thisIsATest')).toBe('this-is-a-test');
    });

    it('should handle strings with no camelCase', () => {
        expect(camelCaseToSlug('test')).toBe('test');
    });

    it('should handle empty strings', () => {
        expect(camelCaseToSlug('')).toBe('');
    });

    it('should handle strings with multiple uppercase letters', () => {
        expect(camelCaseToSlug('camelCaseToSlug')).toBe('camel-case-to-slug');
    });

    it('should handle strings with numbers', () => {
        expect(camelCaseToSlug('test123Case')).toBe('test123-case');
    });

    it('should handle strings with special characters by stripping them out', () => {
        expect(camelCaseToSlug('test!@#$%^&*()_+Case')).toBe('test-case');
    });

    it('should trim leading and trailing whitespace', () => {
        expect(camelCaseToSlug('  test  ')).toBe('test');
    });
});

