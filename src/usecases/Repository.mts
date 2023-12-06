/*!
 * @license
 * Copyright (C) 2023 Final Hill LLC
 * SPDX-License-Identifier: AGPL-3.0-only
 * @see <https://spdx.org/licenses/AGPL-3.0-only.html>
 */
import { type Entity } from '~/domain/Entity.mjs';

export default abstract class Repository<E extends Entity> extends EventTarget {
    readonly EntityConstructor;

    constructor(EntityConstructor: typeof Entity) {
        super();
        this.EntityConstructor = EntityConstructor;
    }

    abstract getAll(): Promise<E[]>;

    abstract get(id: E['id']): Promise<E | undefined>;

    abstract add(item: E): Promise<void>;

    abstract update(item: E): Promise<void>;

    abstract delete(id: E['id']): Promise<void>;

    abstract clear(): Promise<void>;
}