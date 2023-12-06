import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { Goal } from './Goal.mjs';

describe('Goal', () => {
    test('fromJSON', () => {
        const uuid = crypto.randomUUID(),
            goal = Goal.fromJSON({
                id: uuid,
                statement: 'test'
            });
        assert.strictEqual(goal.id, uuid);
        assert.strictEqual(goal.statement, 'test');
    });

    test('toJSON', () => {
        const uuid = crypto.randomUUID(),
            goal = new Goal({ id: uuid, statement: 'test' });
        assert.strictEqual(goal.toJSON().id, uuid);
        assert.strictEqual(goal.toJSON().statement, 'test');
    });
});