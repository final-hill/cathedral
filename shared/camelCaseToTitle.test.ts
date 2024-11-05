import { describe, it, expect } from 'vitest';
import camelCaseToTitle from './camelCaseToTitle';

describe('camelCaseToTitle', () => {
    it('should convert camelCase to Title Case', () => {
        expect(camelCaseToTitle('camelCaseString')).toBe('Camel Case String');
    });

    it('should handle single word', () => {
        expect(camelCaseToTitle('word')).toBe('Word');
    });

    it('should handle empty string', () => {
        expect(camelCaseToTitle('')).toBe('');
    });

    it('should handle multiple camelCase words', () => {
        expect(camelCaseToTitle('thisIsATestString')).toBe('This Is A Test String');
    });

    it('should handle strings with numbers', () => {
        expect(camelCaseToTitle('testString123')).toBe('Test String123');
    });

    // trim leading and trailing whitespace
    it('should trim leading and trailing whitespace', () => {
        expect(camelCaseToTitle('  test  ')).toBe('Test');
    });
});