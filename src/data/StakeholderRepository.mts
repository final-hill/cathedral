/*!
 * @license
 * Copyright (C) 2023 Final Hill LLC
 * SPDX-License-Identifier: AGPL-3.0-only
 * @see <https://spdx.org/licenses/AGPL-3.0-only.html>
 */
import { Stakeholder } from '~/domain/Stakeholder.mjs';
import { LocalStorageRepository } from './LocalStorageRepository.mjs';

export class StakeholderRepository extends LocalStorageRepository<Stakeholder> {
    constructor() { super('stakeholder', Stakeholder); }
}