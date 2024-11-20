import { describe, it, expect } from 'vitest';
import { deSlugify } from './deSlugify';

describe('deSlugify', () => {
    it('should replace hyphens with spaces', () => {
        expect(deSlugify('hello-world')).toBe('Hello World');
    });

    it('should convert to Title Case', () => {
        expect(deSlugify('hello-world')).toBe('Hello World');
    });

    it('should handle multiple hyphens', () => {
        expect(deSlugify('this-is-a-test')).toBe('This Is A Test');
    });

    it('should handle single word', () => {
        expect(deSlugify('test')).toBe('Test');
    });

    it('should handle empty string', () => {
        expect(deSlugify('')).toBe('');
    });
});