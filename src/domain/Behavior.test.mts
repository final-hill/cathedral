import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { Behavior } from './Behavior.mjs';

describe('Behavior', () => {
    test('fromJSON', () => {
        const uuid = crypto.randomUUID(),
            behavior = Behavior.fromJSON({
                id: uuid,
                statement: 'test'
            });
        assert.strictEqual(behavior.id, uuid);
        assert.strictEqual(behavior.statement, 'test');
    });

    test('toJSON', () => {
        const uuid = crypto.randomUUID(),
            behavior = new Behavior({ id: uuid, statement: 'test' });
        assert.strictEqual(behavior.toJSON().id, uuid);
        assert.strictEqual(behavior.toJSON().statement, 'test');
    });
});