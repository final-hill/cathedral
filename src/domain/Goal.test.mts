/*!
 * @license
 * Copyright (C) 2023 Final Hill LLC
 * SPDX-License-Identifier: AGPL-3.0-only
 * @see <https://spdx.org/licenses/AGPL-3.0-only.html>
 */

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