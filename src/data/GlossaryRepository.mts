/*!
 * @license
 * Copyright (C) 2023 Final Hill LLC
 * SPDX-License-Identifier: AGPL-3.0-only
 * @see <https://spdx.org/licenses/AGPL-3.0-only.html>
 */
import { GlossaryTerm } from '~/domain/GlossaryTerm.mjs';
import { LocalStorageRepository } from './LocalStorageRepository.mjs';

export class GlossaryRepository extends LocalStorageRepository<GlossaryTerm> {
    constructor() {
        super('glossary', GlossaryTerm);
    }
}