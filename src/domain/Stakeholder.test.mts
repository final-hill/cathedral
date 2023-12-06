/*!
 * @license
 * Copyright (C) 2023 Final Hill LLC
 * SPDX-License-Identifier: AGPL-3.0-only
 * @see <https://spdx.org/licenses/AGPL-3.0-only.html>
 */

import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { Stakeholder, StakeholderCategory, StakeholderSegmentation } from './Stakeholder.mjs';

describe('Stakeholder', () => {
    test('fromJSON', () => {
        const uuid = crypto.randomUUID(),
            stakeholder = Stakeholder.fromJSON({
                id: uuid,
                category: StakeholderCategory.KeyStakeholder,
                description: 'test',
                name: 'Sample Stakeholder',
                segmentation: StakeholderSegmentation.Client
            });
        assert.strictEqual(stakeholder.id, uuid);
        assert.strictEqual(stakeholder.category, StakeholderCategory.KeyStakeholder);
        assert.strictEqual(stakeholder.description, 'test');
        assert.strictEqual(stakeholder.name, 'Sample Stakeholder');
        assert.strictEqual(stakeholder.segmentation, StakeholderSegmentation.Client);
    });

    test('toJSON', () => {
        const uuid = crypto.randomUUID(),
            stakeholder = new Stakeholder({
                id: uuid,
                category: StakeholderCategory.KeyStakeholder,
                description: 'test',
                name: 'Sample Stakeholder',
                segmentation: StakeholderSegmentation.Client
            }),
            json = stakeholder.toJSON();
        assert.strictEqual(json.id, uuid);
        assert.strictEqual(json.category, StakeholderCategory.KeyStakeholder);
        assert.strictEqual(json.description, 'test');
        assert.strictEqual(json.name, 'Sample Stakeholder');
        assert.strictEqual(json.segmentation, StakeholderSegmentation.Client);
    });
});