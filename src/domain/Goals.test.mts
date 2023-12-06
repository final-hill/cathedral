import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { Goals } from './Goals.mjs';

describe('Goals', () => {
    test('fromJSON', () => {
        const id = crypto.randomUUID(),
            fids = Array.from({ length: 3 }, () => crypto.randomUUID()),
            sids = Array.from({ length: 3 }, () => crypto.randomUUID()),
            goals = Goals.fromJSON({
                functionalBehaviors: fids,
                id,
                description: 'test',
                name: 'test',
                objective: 'test',
                outcomes: 'test',
                situation: 'test',
                stakeholders: sids
            });
        assert.strictEqual(goals.id, id);
        assert.strictEqual(goals.description, 'test');
        assert.strictEqual(goals.name, 'test');
        assert.strictEqual(goals.objective, 'test');
        assert.strictEqual(goals.outcomes, 'test');
        assert.strictEqual(goals.situation, 'test');
        assert.strictEqual(goals.functionalBehaviors.length, 3);
        goals.functionalBehaviors.forEach((fid, index) => {
            assert.strictEqual(fid, fids[index]);
        });
        assert.strictEqual(goals.stakeholders.length, 3);
        goals.stakeholders.forEach((sid, index) => {
            assert.strictEqual(sid, sids[index]);
        });
    });

    test('toJSON', () => {
        const id = crypto.randomUUID(),
            fids = Array.from({ length: 3 }, () => crypto.randomUUID()),
            sids = Array.from({ length: 3 }, () => crypto.randomUUID()),
            goals = new Goals({
                functionalBehaviors: fids,
                id,
                description: 'test',
                name: 'test',
                objective: 'test',
                outcomes: 'test',
                situation: 'test',
                stakeholders: sids
            }),
            json = goals.toJSON();
        assert.strictEqual(json.id, id);
        assert.strictEqual(json.description, 'test');
        assert.strictEqual(json.name, 'test');
        assert.strictEqual(json.objective, 'test');
        assert.strictEqual(json.outcomes, 'test');
        assert.strictEqual(json.situation, 'test');
        assert.strictEqual(json.functionalBehaviors.length, 3);
        json.functionalBehaviors.forEach((fid, index) => {
            assert.strictEqual(fid, fids[index]);
        });
        assert.strictEqual(json.stakeholders.length, 3);
        json.stakeholders.forEach((sid, index) => {
            assert.strictEqual(sid, sids[index]);
        });
    });
});