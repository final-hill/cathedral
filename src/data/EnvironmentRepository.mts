/*!
 * @license
 * Copyright (C) 2023 Final Hill LLC
 * SPDX-License-Identifier: AGPL-3.0-only
 * @see <https://spdx.org/licenses/AGPL-3.0-only.html>
 */
import { Environment } from '~/domain/Environment.mjs';
import { PEGSRepository } from './PEGSRepository.mjs';

export class EnvironmentRepository extends PEGSRepository<Environment> {
    constructor() { super('environments', Environment); }
}