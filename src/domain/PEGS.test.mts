/*!
 * @license
 * Copyright (C) 2023 Final Hill LLC
 * SPDX-License-Identifier: AGPL-3.0-only
 * @see <https://spdx.org/licenses/AGPL-3.0-only.html>
 */

import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { PEGS } from './PEGS.mjs';

describe('PEGS', () => {
    test('static properties', () => {
        assert.strictEqual(PEGS.maxNameLength, 60);
        assert.strictEqual(PEGS.maxDescriptionLength, 200);
        assert.strictEqual(typeof PEGS.slugify, 'function');
    });

    test('slugify', () => {
        assert.strictEqual(PEGS.slugify('test'), 'test');
        assert.strictEqual(PEGS.slugify('test test'), 'test-test');
        assert.strictEqual(PEGS.slugify('test test test'), 'test-test-test');
    });

    test('long name', () => {
        const longName = 'a'.repeat(PEGS.maxNameLength + 1);
        assert.throws(() => new PEGS({
            id: crypto.randomUUID(),
            description: '',
            name: longName
        }), {
            message: `Project name cannot be longer than ${PEGS.maxNameLength} characters`
        });
    });

    test('long description', () => {
        const longDescription = 'a'.repeat(PEGS.maxDescriptionLength + 1);
        assert.throws(() => new PEGS({
            id: crypto.randomUUID(),
            description: longDescription,
            name: ''
        }), {
            message: `Project description cannot be longer than ${PEGS.maxDescriptionLength} characters`
        });
    });

    test('fromJSON', () => {
        const uuid = crypto.randomUUID(),
            pegs = PEGS.fromJSON({
                id: uuid,
                name: 'Sample PEGS',
                description: 'test'
            });
        assert.strictEqual(pegs.id, uuid);
        assert.strictEqual(pegs.name, 'Sample PEGS');
        assert.strictEqual(pegs.description, 'test');
        assert.strictEqual(pegs.slug(), 'sample-pegs');
    });

    test('toJSON', () => {
        const uuid = crypto.randomUUID(),
            pegs = new PEGS({ id: uuid, description: 'test', name: 'test' }),
            json = pegs.toJSON();
        assert.strictEqual(json.id, uuid);
        assert.strictEqual(json.description, 'test');
        assert.strictEqual(json.name, 'test');
    });
});