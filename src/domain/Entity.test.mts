/*!
 * @license
 * Copyright (C) 2023 Final Hill LLC
 * SPDX-License-Identifier: AGPL-3.0-only
 * @see <https://spdx.org/licenses/AGPL-3.0-only.html>
 */

import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { Entity } from './Entity.mjs';

describe('Entity', () => {
    test('static properties', () => {
        assert.strictEqual(Entity.emptyId, '00000000-0000-0000-0000-000000000000');
    });

    test('fromJSON', () => {
        const uuid = crypto.randomUUID(),
            entity = Entity.fromJSON({ id: uuid });
        assert.strictEqual(entity.id, uuid);
    });

    test('toJSON', () => {
        const uuid = crypto.randomUUID(),
            entity = new Entity({ id: uuid }),
            json = entity.toJSON();
        assert.strictEqual(json.id, uuid);
    });

    test('equals', () => {
        const uuid = crypto.randomUUID(),
            entity1 = new Entity({ id: uuid }),
            entity2 = new Entity({ id: uuid }),
            entity3 = new Entity({ id: uuid });

        // reflexive
        assert.ok(entity1.equals(entity1));

        // symmetric
        assert.ok(entity1.equals(entity2));
        assert.ok(entity2.equals(entity1));

        // transitive
        assert.ok(entity1.equals(entity2));
        assert.ok(entity2.equals(entity3));
        assert.ok(entity1.equals(entity3));
    });

    test('not equals', () => {
        const entity1 = new Entity({ id: crypto.randomUUID() }),
            entity2 = new Entity({ id: crypto.randomUUID() });

        assert.ok(!entity1.equals(entity2));
        assert.ok(!entity2.equals(entity1));
    });
});