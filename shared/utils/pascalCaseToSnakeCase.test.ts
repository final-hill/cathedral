import { describe, it, expect } from 'vitest';
import { pascalCaseToSnakeCase } from './pascalCaseToSnakeCase';

describe('pascalCaseToSnakeCase', () => {
    it('should convert PascalCase to snake_case', () => {
        expect(pascalCaseToSnakeCase('PascalCase')).toBe('pascal_case');
    });

    it('should handle single word', () => {
        expect(pascalCaseToSnakeCase('Word')).toBe('word');
    });

    it('should handle empty string', () => {
        expect(pascalCaseToSnakeCase('')).toBe('');
    });

    it('should handle multiple PascalCase words', () => {
        expect(pascalCaseToSnakeCase('ThisIsATestString')).toBe('this_is_a_test_string');
    });

    it('should handle strings with numbers', () => {
        expect(pascalCaseToSnakeCase('TestString123')).toBe('test_string123');
    });

    it('should trim leading and trailing whitespace', () => {
        expect(pascalCaseToSnakeCase('  Test  ')).toBe('test');
    });
});