import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { Environment } from './Environment.mjs';

describe('Environment', () => {
    test('fromJSON', () => {
        const envId = crypto.randomUUID(),
            glossaryIds = Array.from({ length: 3 }, () => crypto.randomUUID()),
            environment = Environment.fromJSON({
                id: envId,
                name: 'test',
                description: 'test description',
                glossary: glossaryIds,
            });
        assert.strictEqual(environment.id, envId);
        assert.strictEqual(environment.name, 'test');
        assert.strictEqual(environment.description, 'test description');
        assert.strictEqual(environment.glossary.length, 3);
        assert.strictEqual(environment.glossary[0], glossaryIds[0]);
        assert.strictEqual(environment.glossary[1], glossaryIds[1]);
        assert.strictEqual(environment.glossary[2], glossaryIds[2]);
    });

    test('toJSON', () => {
        const envId = crypto.randomUUID(),
            glossaryIds = Array.from({ length: 3 }, () => crypto.randomUUID()),
            environment = new Environment({
                id: envId,
                name: 'test',
                description: 'test description',
                glossary: glossaryIds,
            }),
            json = environment.toJSON();
        assert.strictEqual(json.id, envId);
        assert.strictEqual(json.name, 'test');
        assert.strictEqual(json.description, 'test description');
        assert.strictEqual(json.glossary.length, 3);
        assert.strictEqual(json.glossary[0], glossaryIds[0]);
        assert.strictEqual(json.glossary[1], glossaryIds[1]);
        assert.strictEqual(json.glossary[2], glossaryIds[2]);
    });
});