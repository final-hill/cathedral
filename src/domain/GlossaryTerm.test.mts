import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { GlossaryTerm } from './GlossaryTerm.mjs';

describe('GlossaryTerm', () => {
    test('fromJSON', () => {
        const uuid = crypto.randomUUID(),
            glossaryTerm = GlossaryTerm.fromJSON({
                id: uuid,
                term: 'test',
                definition: 'test description',
            });
        assert.strictEqual(glossaryTerm.id, uuid);
        assert.strictEqual(glossaryTerm.term, 'test');
        assert.strictEqual(glossaryTerm.definition, 'test description');
    });

    test('toJSON', () => {
        const uuid = crypto.randomUUID(),
            glossaryTerm = new GlossaryTerm({
                id: uuid,
                term: 'test',
                definition: 'test description',
            }),
            json = glossaryTerm.toJSON();
        assert.strictEqual(json.id, uuid);
        assert.strictEqual(json.term, 'test');
        assert.strictEqual(json.definition, 'test description');
    });
});