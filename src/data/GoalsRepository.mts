/*!
 * @license
 * Copyright (C) 2023 Final Hill LLC
 * SPDX-License-Identifier: AGPL-3.0-only
 * @see <https://spdx.org/licenses/AGPL-3.0-only.html>
 */
import { Goals } from '~/domain/Goals.mjs';
import { PEGSRepository } from './PEGSRepository.mjs';

export class GoalsRepository extends PEGSRepository<Goals> {
    constructor() { super('goals', Goals); }
}