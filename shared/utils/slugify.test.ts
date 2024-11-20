import { describe, it, expect } from 'vitest';
import { slugify } from './slugify';

describe('slugify', () => {
    it('should convert a string to lowercase', () => {
        expect(slugify('Hello World')).toBe('hello-world');
    });

    it('should replace spaces with hyphens', () => {
        expect(slugify('Hello World')).toBe('hello-world');
    });

    it('should remove non-word characters', () => {
        expect(slugify('Hello, World!')).toBe('hello-world');
    });

    it('should trim leading and trailing whitespace', () => {
        expect(slugify('  Hello World  ')).toBe('hello-world');
    });

    it('should replace multiple spaces with a single hyphen', () => {
        expect(slugify('Hello    World')).toBe('hello-world');
    });

    it('should replace multiple hyphens with a single hyphen', () => {
        expect(slugify('Hello--World')).toBe('hello-world');
    });

    it('should handle empty strings', () => {
        expect(slugify('')).toBe('');
    });

    it('should handle strings with only non-word characters', () => {
        expect(slugify('!@#$%^&*()')).toBe('');
    });

    it('should handle strings with mixed case and special characters', () => {
        expect(slugify('Hello-World! This is a Test.')).toBe('hello-world-this-is-a-test');
    });
});