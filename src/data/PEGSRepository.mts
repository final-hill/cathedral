/*!
 * @license
 * Copyright (C) 2023 Final Hill LLC
 * SPDX-License-Identifier: AGPL-3.0-only
 * @see <https://spdx.org/licenses/AGPL-3.0-only.html>
 */
import type { PEGS } from '~/domain/PEGS.mjs';
import { LocalStorageRepository } from './LocalStorageRepository.mjs';

export abstract class PEGSRepository<E extends PEGS> extends LocalStorageRepository<E> {
    constructor(storageKey: string, EntityConstructor: typeof PEGS) {
        super(storageKey, EntityConstructor);
    }

    async getBySlug(slug: string): Promise<E | undefined> {
        return (await this.getAll()).find(e => e.slug() === slug);
    }
}