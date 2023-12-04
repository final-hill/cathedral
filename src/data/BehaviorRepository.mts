/*!
 * @license
 * Copyright (C) 2023 Final Hill LLC
 * SPDX-License-Identifier: AGPL-3.0-only
 * @see <https://spdx.org/licenses/AGPL-3.0-only.html>
 */
import { Behavior } from '~/domain/Behavior.mjs';
import { LocalStorageRepository } from './LocalStorageRepository.mjs';

export class BehaviorRepository extends LocalStorageRepository<Behavior> {
    constructor() { super('behavior', Behavior); }
}