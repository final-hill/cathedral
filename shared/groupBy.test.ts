import { describe, it, expect } from 'vitest';
import groupBy from '~/shared/groupBy';

describe('groupBy', () => {
    it('should group items by a string key', () => {
        const items = [
            { category: 'fruit', name: 'apple' },
            { category: 'fruit', name: 'banana' },
            { category: 'vegetable', name: 'carrot' }
        ];
        const result = groupBy(items, item => item.category);
        expect(result).toEqual({
            fruit: [
                { category: 'fruit', name: 'apple' },
                { category: 'fruit', name: 'banana' }
            ],
            vegetable: [
                { category: 'vegetable', name: 'carrot' }
            ]
        });
    });

    it('should group items by a numeric key', () => {
        const items = [1.1, 2.2, 1.3, 2.4];
        const result = groupBy(items, item => Math.floor(item));
        expect(result).toEqual({
            1: [1.1, 1.3],
            2: [2.2, 2.4]
        });
    });

    it('should handle an empty array', () => {
        const items: any[] = [];
        const result = groupBy(items, item => item);
        expect(result).toEqual({});
    });

    it('should handle grouping by index', () => {
        const items = ['a', 'b', 'c', 'd'];
        const result = groupBy(items, (item, index) => index % 2);
        expect(result).toEqual({
            0: ['a', 'c'],
            1: ['b', 'd']
        });
    });
});